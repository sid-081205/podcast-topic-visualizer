import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Test server running', timestamp: new Date().toISOString() });
});

// Extract video ID
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Method 1: Using ytdl-core
app.post('/api/transcript/ytdl', async (req, res) => {
  try {
    const { url, videoId } = req.body;
    console.log('Testing ytdl-core method for:', videoId);
    
    // Dynamic import of ytdl-core
    const ytdl = await import('ytdl-core');
    
    const info = await ytdl.default.getInfo(videoId);
    const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No caption tracks found');
    }
    
    // Get the first available caption track (preferably English)
    const englishTrack = captionTracks.find(track => 
      track.languageCode === 'en' || track.languageCode === 'en-US'
    ) || captionTracks[0];
    
    // Fetch caption content
    const captionResponse = await axios.get(englishTrack.baseUrl);
    const xmlContent = captionResponse.data;
    
    // Parse XML captions
    const textMatches = xmlContent.match(/<text[^>]*>(.*?)<\/text>/g) || [];
    const transcript = textMatches.map(match => {
      return match.replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }).filter(text => text.length > 0).join(' ');
    
    res.json({
      success: true,
      method: 'ytdl-core',
      videoId,
      transcript,
      totalLength: transcript.length,
      segmentCount: textMatches.length,
      language: englishTrack.languageCode
    });
    
  } catch (error) {
    console.error('ytdl-core method failed:', error.message);
    res.status(500).json({ error: `ytdl-core failed: ${error.message}` });
  }
});

// Method 2: Web scraping approach
app.post('/api/transcript/scrape', async (req, res) => {
  try {
    const { url, videoId } = req.body;
    console.log('Testing web scraping method for:', videoId);
    
    // Fetch the YouTube page
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    
    // Try to find caption data in the page
    const captionRegex = /"captions":\s*({[^}]+captionTracks[^}]+})/;
    const match = html.match(captionRegex);
    
    if (!match) {
      throw new Error('No caption data found in page HTML');
    }
    
    // This is a simplified approach - in reality, you'd need more complex parsing
    const transcript = 'Sample transcript from web scraping method - this would contain the actual extracted text';
    
    res.json({
      success: true,
      method: 'web-scraping',
      videoId,
      transcript,
      totalLength: transcript.length,
      note: 'This is a demo - real implementation would parse the extracted caption data'
    });
    
  } catch (error) {
    console.error('Web scraping method failed:', error.message);
    res.status(500).json({ error: `Web scraping failed: ${error.message}` });
  }
});

// Method 3: Using yt-dlp command line tool
app.post('/api/transcript/api', async (req, res) => {
  try {
    const { url, videoId } = req.body;
    console.log('Testing yt-dlp method for:', videoId);
    
    // Check if yt-dlp is installed
    try {
      await execAsync('yt-dlp --version');
    } catch (error) {
      throw new Error('yt-dlp not installed. Install with: pip install yt-dlp');
    }
    
    // Use yt-dlp to extract subtitles
    const command = `yt-dlp --write-auto-sub --sub-lang en --skip-download --print-json "${url}"`;
    const { stdout } = await execAsync(command, { timeout: 30000 });
    
    // Parse the JSON output
    const videoInfo = JSON.parse(stdout);
    
    if (!videoInfo.automatic_captions && !videoInfo.subtitles) {
      throw new Error('No captions available for this video');
    }
    
    // This would normally extract the actual subtitle file
    const transcript = 'Transcript extracted using yt-dlp - this would contain the actual subtitle content';
    
    res.json({
      success: true,
      method: 'yt-dlp',
      videoId,
      transcript,
      totalLength: transcript.length,
      title: videoInfo.title,
      duration: videoInfo.duration
    });
    
  } catch (error) {
    console.error('yt-dlp method failed:', error.message);
    res.status(500).json({ error: `yt-dlp failed: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Open test-transcript.html and point it to this server`);
  console.log('Available methods: ytdl, scrape, api');
});
