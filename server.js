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
        const { transcript } = req.body;
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        console.log('Analyzing transcript of length:', transcript.length);

        const enhancedPrompt = `You are an expert podcast analyst. Analyze this podcast transcript and extract detailed topics with rich, specific information. 

TRANSCRIPT:
${transcript}

Please provide a comprehensive analysis following this EXACT JSON structure:

{
  "mainTopics": [
    {
      "id": 1,
      "title": "Specific Topic Title",
      "description": "Detailed 2-3 sentence description of what this topic covers and its significance in the discussion",
      "quotes": [
        "Exact memorable quote 1 from the transcript",
        "Exact memorable quote 2 from the transcript",
        "Exact memorable quote 3 from the transcript"
      ],
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "position": { "x": 0, "y": 0, "z": 0 },
      "size": 4.5,
      "subtopics": [
        {
          "id": 11,
          "title": "Specific Subtopic Title",
          "description": "Detailed description of this specific aspect discussed",
          "quotes": ["Exact quote related to this subtopic"],
          "keywords": ["specific", "keyword", "terms"],
          "position": { "x": 15, "y": 8, "z": -10 },
          "size": 2.5
        }
      ]
    }
  ]
}

ANALYSIS REQUIREMENTS:

1. TOPIC IDENTIFICATION:
   - Find 3-6 MAJOR topics that were substantially discussed (not just mentioned)
   - Topics should represent distinct themes, not overlapping concepts
   - Focus on topics that had genuine depth and multiple perspectives shared
   - Prioritize topics with concrete examples, stories, or detailed explanations

2. TOPIC TITLES:
   - Use specific, descriptive titles (not generic like "Technology" but "AI's Impact on Creative Industries")
   - Make titles compelling and informative
   - Capture the specific angle or perspective discussed

3. DESCRIPTIONS:
   - Write 2-3 sentences explaining what was actually discussed about this topic
   - Include WHY this topic matters based on the conversation
   - Mention specific contexts, examples, or applications discussed
   - Avoid generic descriptions - be specific to THIS conversation

4. QUOTES EXTRACTION:
   - Extract 2-4 EXACT quotes per topic (verbatim from transcript)
   - Choose impactful, memorable, or insightful quotes
   - Select quotes that capture key insights, surprising facts, or strong opinions
   - Prioritize quotes with specific data, personal stories, or unique perspectives
   - Each quote should be 10-50 words long for readability

5. KEYWORDS:
   - Include 4-6 specific terms actually used in the discussion
   - Mix technical terms, concepts, names, and action words
   - Focus on terms that would help someone find or understand this topic
   - Include both broad concepts and specific terminology

6. SUBTOPICS:
   - Create 1-3 subtopics per main topic
   - Subtopics should be specific aspects, examples, or dimensions of the main topic
   - Each subtopic should have been discussed for at least 2-3 exchanges
   - Include specific quotes and keywords for each subtopic

7. CONVERSATION CONTEXT:
   - Focus on topics where multiple viewpoints were shared
   - Prioritize topics with personal experiences, case studies, or examples
   - Include topics that generated follow-up questions or deeper exploration
   - Look for topics that connect to broader themes or implications

8. DEPTH INDICATORS:
   - Topics with specific statistics, data, or research mentioned
   - Topics where personal anecdotes or stories were shared
   - Topics that included practical advice or actionable insights
   - Topics that addressed challenges, solutions, or future implications
   - Topics that included comparisons, contrasts, or multiple perspectives

POSITIONING (use these coordinates for visual layout):
- Main Topic 1: {"x": 0, "y": 0, "z": 0}
- Main Topic 2: {"x": 35, "y": 5, "z": 25}
- Main Topic 3: {"x": -30, "y": -8, "z": 20}
- Main Topic 4: {"x": 25, "y": 15, "z": -25}
- Main Topic 5: {"x": -35, "y": 10, "z": -15}
- Main Topic 6: {"x": 15, "y": -12, "z": 30}

For subtopics, position them 12-18 units away from their parent topic.

SIZE GUIDELINES:
- Main topics: 3.5-5.5 (based on discussion depth and time spent)
- Subtopics: 2.0-3.0 (based on detail level)

Return ONLY the JSON object with NO additional text or formatting. Ensure all quotes are extracted exactly as spoken in the transcript.`;

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8000,
            temperature: 0.3,
            messages: [
                {
                    role: "user",
                    content: enhancedPrompt
                }
            ]
        });

        console.log('Claude response received');
        
        let analysisText = message.content[0].text.trim();
        
        // Clean up the response to ensure it's valid JSON
        if (analysisText.startsWith('```json')) {
            analysisText = analysisText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        }
        if (analysisText.startsWith('```')) {
            analysisText = analysisText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        try {
            const analysis = JSON.parse(analysisText);
            
            // Validate the structure
            if (!analysis.mainTopics || !Array.isArray(analysis.mainTopics)) {
                throw new Error('Invalid analysis structure');
            }
            
            console.log('Analysis completed successfully, found', analysis.mainTopics.length, 'topics');
            res.json(analysis);
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.log('Raw response:', analysisText.substring(0, 500));
            
            // Return a structured error response
            res.status(500).json({ 
                error: 'Failed to parse AI response',
                details: parseError.message,
                rawResponse: analysisText.substring(0, 200) + '...'
            });
        }

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed', 
            details: error.message 
        });
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
