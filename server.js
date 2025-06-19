import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Analyze transcript with Claude AI
app.post('/api/analyze', async (req, res) => {
  try {
    console.log('=== ANALYSIS REQUEST START ===');
    console.log('Received analysis request');
    const { transcript } = req.body;
    
    if (!transcript) {
      console.error('No transcript provided');
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    console.log('Transcript length:', transcript.length);
    console.log('Transcript preview:', transcript.substring(0, 200) + '...');
    
    if (transcript.length < 200) {
      console.error('Transcript too short:', transcript.length);
      return res.status(400).json({ error: 'Transcript too short. Please provide at least 200 characters for meaningful analysis.' });
    }
    
    // Always create a fallback first
    const createFallback = () => {
      console.log('Creating fallback analysis...');
      const words = transcript.toLowerCase().split(/\s+/);
      const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      return {
        mainTopics: [
          {
            id: 1,
            title: "Main Discussion",
            description: "Primary topics discussed in this content",
            quotes: [sentences[0] ? sentences[0].trim() + '...' : transcript.substring(0, 100) + '...'],
            position: { x: 0, y: 0, z: 0 },
            size: 4,
            subtopics: []
          },
          {
            id: 2,
            title: "Key Insights",
            description: "Important points and insights",
            quotes: [sentences[Math.floor(sentences.length/2)] ? sentences[Math.floor(sentences.length/2)].trim() + '...' : transcript.substring(transcript.length/2, transcript.length/2 + 100) + '...'],
            position: { x: 25, y: 5, z: 15 },
            size: 3,
            subtopics: []
          },
          {
            id: 3,
            title: "Conclusion",
            description: "Final thoughts and takeaways",
            quotes: [sentences[sentences.length-1] ? sentences[sentences.length-1].trim() + '...' : transcript.substring(transcript.length - 100)],
            position: { x: -20, y: -5, z: 20 },
            size: 3,
            subtopics: []
          }
        ]
      };
    };
    
    // Try Claude AI first
    if (process.env.CLAUDE_API_KEY) {
      console.log('Attempting Claude AI analysis...');
      
      try {
        const cleanedTranscript = transcript
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        const message = await anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 2000,
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: `Analyze this transcript and identify 3-5 SPECIFIC, CONCRETE topics that are actually discussed in detail. 

DO NOT create generic topics like "Introduction", "Main Discussion", "Conclusion".
DO NOT create topics like "Key Points" or "Final Thoughts".

Instead, identify the ACTUAL SUBJECTS being talked about, such as:
- Specific technologies mentioned
- Particular concepts explained  
- Named methodologies discussed
- Concrete examples given
- Specific industries/fields covered

Return ONLY valid JSON:
{
  "mainTopics": [
    {
      "id": 1,
      "title": "Specific Topic Name (not generic)",
      "description": "What specifically is discussed about this topic",
      "quotes": ["Direct quote from transcript", "Another specific quote"],
      "keywords": ["keyword1", "keyword2"],
      "subtopics": [
        {
          "id": 11,
          "title": "Specific subtopic",
          "description": "Specific aspect discussed",
          "quotes": ["Relevant quote"]
        }
      ]
    }
  ]
}

Focus on CONCRETE topics that someone could learn something specific about.

Transcript: "${cleanedTranscript.substring(0, 4000)}"`
            }
          ]
        });

        let analysisText = message.content[0].text.trim();
        console.log('Claude response received, length:', analysisText.length);
        
        // Extract JSON from response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisText = jsonMatch[0];
        }
        
        const analysis = JSON.parse(analysisText);
        
        if (analysis.mainTopics && analysis.mainTopics.length > 0) {
          console.log('✅ Claude analysis successful');
          return res.json(analysis);
        } else {
          throw new Error('No topics in Claude response');
        }
        
      } catch (claudeError) {
        console.error('Claude AI failed:', claudeError.message);
        console.log('Falling back to simple analysis...');
      }
    } else {
      console.log('No Claude API key, using fallback analysis...');
    }
    
    // Return fallback analysis
    const fallbackAnalysis = createFallback();
    console.log('✅ Returning fallback analysis');
    console.log('=== ANALYSIS REQUEST END ===');
    res.json(fallbackAnalysis);
    
  } catch (error) {
    console.error('=== ANALYSIS ERROR ===');
    console.error('Error analyzing transcript:', error);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    
    // Even on error, try to return something useful
    try {
      const basicAnalysis = {
        mainTopics: [
          {
            id: 1,
            title: "Content Analysis",
            description: "Basic analysis of the provided content",
            quotes: [req.body.transcript ? req.body.transcript.substring(0, 100) + '...' : 'No content available'],
            position: { x: 0, y: 0, z: 0 },
            size: 4,
            subtopics: []
          }
        ]
      };
      res.json(basicAnalysis);
    } catch (finalError) {
      res.status(500).json({ error: 'Analysis failed completely: ' + error.message });
    }
  }
});

// Test endpoint for direct transcript analysis
app.post('/api/test-analyze', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    console.log('Direct transcript analysis request, length:', transcript.length);
    
    // Simple validation
    if (transcript.length < 50) {
      return res.status(400).json({ error: 'Transcript too short (minimum 50 characters)' });
    }
    
    res.json({ 
      success: true, 
      message: 'Transcript received successfully',
      length: transcript.length,
      preview: transcript.substring(0, 100) + '...' 
    });
    
  } catch (error) {
    console.error('Test analyze error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Claude API Key configured: ${process.env.CLAUDE_API_KEY ? 'Yes' : 'No'}`);
  console.log('Ready to process YouTube transcript requests!');
});
