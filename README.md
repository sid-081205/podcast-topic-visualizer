# podcast topic visualizer

ai-powered 3d visualization of podcast transcripts. paste text, get floating topic bubbles.

## what it does

- **transcript analysis**: claude ai finds topics, subtopics, quotes
- **3d visualization**: interactive space with topic bubbles and connections  
- **exploration**: click bubbles to see details, quotes, relationships
- **smart extraction**: finds actual discussion themes, not just keywords

## setup

```bash
npm install
echo "CLAUDE_API_KEY=your_key" > .env
npm run dev
```

get claude key: https://console.anthropic.com/

## usage

1. paste transcript in text area
2. click "analyze topics" 
3. explore 3d space:
   - drag to rotate
   - scroll to zoom
   - click bubbles for details

## demo mode

click "show demo" to see example visualization without transcript

## tech stack

- **frontend**: three.js, vanilla js
- **backend**: node.js, express
- **ai**: anthropic claude 3 sonnet
- **build**: vite

## api

- `GET /health` - server status
- `POST /api/analyze` - extract topics from transcript

## troubleshooting

**nothing happens on analyze:**
- check server running: `curl localhost:3001/health`
- verify api key in `.env`
- transcript needs 200+ characters

**analysis fails:**
- invalid claude api key
- api quota exceeded  
- transcript too short/generic

**no visualization:**
- try demo mode first
- check browser webgl support
- look for js errors in console

## visualization features

- **main topics**: large colored spheres
- **subtopics**: smaller connected bubbles  
- **hover effects**: glow, scale, connection lines
- **click details**: quotes, descriptions, keywords
- **smooth animations**: floating, rotation, transitions

## file structure

```
├── index.html     # ui and styles
├── main.js        # 3d visualization logic  
├── server.js      # backend + ai integration
└── package.json   # deps and scripts
```

## best transcripts

works well with:
- technical discussions (ai, programming)
- interview shows (business, startup)  
- educational content (lectures, talks)
- panel discussions (politics, philosophy)

minimum 200 chars, longer = better analysis

## contributing

open to prs for:
- new visualization effects
- better topic extraction
- mobile support
- export features

mit license