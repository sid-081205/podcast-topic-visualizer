# Podcast Topic Visualizer

An AI-powered tool that analyzes podcast transcripts and creates stunning interactive 3D visualizations of the topics discussed, complete with subtopics, quotes, and immersive exploration features.

## ✨ Features

- **📝 Direct Transcript Input**: Paste any podcast transcript directly into the app
- **🤖 Advanced AI Analysis**: Uses Anthropic's Claude AI to intelligently identify topics, subtopics, and extract meaningful quotes
- **🌌 Immersive 3D Visualization**: Interactive Three.js space with floating topic bubbles, orbital subtopics, and starfield background
- **🎯 Smart Topic Organization**: Main topics with connected subtopics in a hierarchical bubble structure
- **💬 Rich Content Display**: Click bubbles to explore detailed descriptions, quotes, and related subtopics
- **🎮 Intuitive Controls**: Mouse controls for rotation, zoom, and topic exploration
- **✨ Enhanced Visual Effects**: Glow effects, wireframes, orbital animations, and dynamic lighting
- **🔍 Detailed Topic Labels**: Floating text labels with topic titles and descriptions
- **🎨 Smart Color Coding**: Visual relationships between topics and subtopics through color schemes

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
echo "CLAUDE_API_KEY=your_claude_api_key_here" > .env
echo "PORT=3001" >> .env
```

3. **Get your Claude API key** from: https://console.anthropic.com/

4. **Start the application:**
```bash
npm run dev
```

5. **Open your browser** to http://localhost:3000

## 📖 How to Use

1. **Paste Your Transcript**: Copy any podcast transcript into the text area
2. **Analyze Topics**: Click "✨ Analyze Topics" to process with AI
3. **Explore in 3D**: Navigate the space using mouse controls:
   - **Click & Drag**: Rotate the view
   - **Scroll**: Zoom in/out
   - **Click Bubbles**: View detailed topic information
4. **Discover Connections**: Watch subtopics orbit around main topics
5. **Read Insights**: Click topics to see quotes, descriptions, and related content

## 🎮 Demo Mode

- Click "🎮 Show Demo Visualization" to see the system in action
- No transcript needed - shows example topics about AI and technology
- Perfect for testing the 3D visualization features

## 💻 Technologies Used

- **Frontend**: Three.js (3D graphics), Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI**: Anthropic Claude 3 Sonnet (topic analysis)
- **Build Tool**: Vite (fast development and building)
- **3D Graphics**: WebGL, Canvas API for text rendering

## 🔌 API Endpoints

- `GET /health` - Server health check
- `POST /api/analyze` - Analyze transcript with Claude AI to extract topics and subtopics
- `POST /api/test-analyze` - Test endpoint for transcript validation

## 🔑 Getting Claude API Key

1. Visit https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Add it to your `.env` file as `CLAUDE_API_KEY=your_key_here`

## 🛠️ Troubleshooting

### "Nothing happens when I click analyze"

1. **Check server status:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"Server is running"}`

2. **Check browser console (F12):**
   - Look for error messages
   - Verify network requests are successful

3. **Common solutions:**
   - **Server not running**: Execute `npm run dev`
   - **Wrong ports**: Server should be on 3001, frontend on 3000
   - **Missing API key**: Verify `.env` contains `CLAUDE_API_KEY=your_key`
   - **Short transcript**: Ensure at least 200 characters

### "Analysis failed" errors

- **Invalid API key**: Double-check your Claude API key
- **API quota exceeded**: Check your Anthropic account usage
- **Network issues**: Verify internet connection
- **Transcript too short**: Use longer, more detailed transcripts

### "No visualization appears"

- **Try demo mode**: Click "🎮 Show Demo Visualization" to test 3D rendering
- **Browser compatibility**: Use modern browsers (Chrome, Firefox, Safari, Edge)
- **WebGL support**: Ensure your browser supports WebGL
- **Console errors**: Check for JavaScript errors in developer tools

## 🎨 Visualization Features

### Main Topic Bubbles
- **Large spheres** representing primary discussion themes
- **Color-coded** with unique schemes for easy identification
- **Wireframe overlays** for enhanced visual appeal
- **Floating labels** with titles and descriptions
- **Glow effects** for premium visual experience

### Subtopic Organization
- **Smaller spheres** orbiting around main topics
- **Curved connection lines** showing relationships
- **Orbital animations** for dynamic movement
- **Detailed labels** with specific subtopic information
- **Pulse effects** for subtle visual feedback

### Interactive Elements
- **Click detection** on all topic spheres
- **Information panels** with quotes and descriptions
- **Highlighting system** for selected topics
- **Smooth animations** for all interactions
- **Responsive design** for different screen sizes

## 🔧 Development

### Project Structure
```
claude-hack/
├── index.html          # Main HTML file
├── main.js            # 3D visualization and app logic
├── server.js          # Express server and AI integration
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── .env              # Environment variables
```

### Adding New Features
1. **Frontend changes**: Modify `main.js` for visualization features
2. **Backend changes**: Update `server.js` for AI processing
3. **Styling**: Edit CSS in `index.html`
4. **Testing**: Use demo mode for rapid iteration

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Additional AI models for topic analysis
- More visualization themes and effects
- Export functionality for visualizations
- Support for different content types
- Mobile responsiveness enhancements

## 📝 License

MIT License - feel free to use this project for learning and development!

## 🎯 Example Transcripts to Try

For best results, use transcripts from:
- **Technical podcasts** (AI, programming, science)
- **Interview shows** (business, entrepreneurship)
- **Educational content** (TED talks, lectures)
- **Discussion panels** (politics, philosophy)

Minimum 200 characters recommended for meaningful analysis.