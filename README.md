# podcast topic visualizer

made for the claude hackathon: ai-powered 3d visualization of podcast transcripts. paste text, get floating topic bubbles.

## demo video

**github doesn't support html video tags**. use these instead:

**option 1: youtube** (best):
```markdown
[![demo video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtube.com/watch?v=YOUR_VIDEO_ID)
```

**option 2: gif** (works directly):
```markdown
![demo](demo.gif)
```

**option 3: link to google drive**:
```markdown
[📹 watch demo video](https://drive.google.com/file/d/YOUR_FILE_ID/view)
```

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

## visualization features

- **main topics**: large colored spheres
- **subtopics**: smaller connected bubbles  
- **hover effects**: glow, scale, connection lines
- **click details**: quotes, descriptions, keywords
- **smooth animations**: floating, rotation, transitions

## best transcripts

honestly, it's not very robust - gives weird bubble topics for the simplest of podcasts but cool idea nonetheless.