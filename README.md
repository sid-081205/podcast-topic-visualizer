# Podcast Topic Visualizer

An AI-powered tool that extracts transcripts from podcast videos and creates interactive 3D visualizations of the topics discussed.

## Features

- **Transcript Extraction**: Supports YouTube podcast URLs
- **AI Analysis**: Uses Anthropic's Claude AI to identify topics and extract key quotes
- **3D Visualization**: Interactive Three.js bubbles representing topics and subtopics
- **Topic Exploration**: Click bubbles to see detailed information and quotes
- **Intuitive Controls**: Mouse controls for rotation and zoom

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Claude API key:
```
CLAUDE_API_KEY=your_claude_api_key_here
```

3. Get your Claude API key from: https://console.anthropic.com/

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Usage

1. Paste a YouTube podcast URL into the input field
2. Click "Analyze Podcast" 
3. Wait for Claude AI to process the transcript
4. Explore the 3D visualization by clicking on topic bubbles
5. Use mouse to rotate the view and scroll to zoom

## Technologies Used

- **Frontend**: Three.js, Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **AI**: Anthropic Claude 3 Sonnet
- **Transcript**: YouTube Transcript API
- **Build Tool**: Vite

## API Endpoints

- `POST /api/transcript` - Extract transcript from YouTube URL
- `POST /api/analyze` - Analyze transcript with Claude AI to extract topics

## Getting Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file

## Troubleshooting

### "Nothing happens after I press analyze"

1. **Check if server is running:**
   - Open http://localhost:3001/health in your browser
   - Should show: `{"status":"Server is running","timestamp":"..."}`

2. **Check console for errors:**
   - Open browser Developer Tools (F12)
   - Look for error messages in the Console tab

3. **Common issues:**
   - **Server not running**: Run `npm run dev` in terminal
   - **Wrong port**: Make sure server is on port 3001, frontend on 3000
   - **API key missing**: Check `.env` file has `CLAUDE_API_KEY=your_key_here`
   - **Invalid YouTube URL**: Make sure URL has captions/subtitles enabled

4. **Test with a known working video:**
   - Try: https://www.youtube.com/watch?v=dQw4w9WgXcQ (has captions)

### "Failed to fetch transcript"
- Video must have captions/subtitles
- Try a different podcast video
- Check if URL format is correct

### "Claude API error"
- Verify API key is correct in `.env` file
- Check you have Claude API credits
- Try refreshing the page and analyzing again

## Contributing

Feel free to submit issues and enhancement requests!