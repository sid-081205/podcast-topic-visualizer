import * as THREE from 'three';

class PodcastVisualizer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.topics = [];
        this.topicMeshes = [];
        this.isAnalyzing = false;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000011, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Setup camera
        this.camera.position.set(0, 20, 80);
        this.camera.lookAt(0, 0, 0);
        
        // Setup lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Add some stars for background
        this.createStarField();
        
        // Setup controls
        this.setupControls();
        
        // Start render loop
        this.animate();
        
        // Test server connection on startup
        this.testServerConnection();
    }
    
    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
        
        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    async testServerConnection() {
        try {
            const response = await fetch('http://localhost:3001/health');
            if (response.ok) {
                this.updateStatus('✅ Server connected - Ready to analyze!', 'success');
                this.createDemoVisualization();
            } else {
                this.updateStatus('⚠️ Server issues detected', 'error');
            }
        } catch (error) {
            this.updateStatus('❌ Server not running. Start with: npm run dev', 'error');
            console.error('Server connection test failed:', error);
            this.createDemoVisualization();
        }
    }
    
    createDemoVisualization() {
        console.log('Creating demo visualization...');
        
        this.clearVisualization();
        
        const demoTopics = {
            mainTopics: [
                {
                    id: 1,
                    title: "Artificial Intelligence Revolution",
                    description: "Comprehensive discussion about AI's transformative impact across industries, including current applications and future possibilities",
                    quotes: [
                        "AI is not just changing technology, it's reshaping entire industries",
                        "Machine learning algorithms are becoming more sophisticated every day",
                        "The future of work will be defined by human-AI collaboration"
                    ],
                    position: { x: 0, y: 0, z: 0 },
                    size: 6,
                    subtopics: [
                        {
                            id: 11,
                            title: "Machine Learning Applications",
                            description: "Deep dive into practical ML implementations in various sectors",
                            quotes: ["Neural networks are revolutionizing pattern recognition"],
                            position: { x: 18, y: 8, z: -12 },
                            size: 3
                        },
                        {
                            id: 12,
                            title: "Ethics in AI Development",
                            description: "Moral considerations and responsible AI practices",
                            quotes: ["We must ensure AI development serves humanity's best interests"],
                            position: { x: -15, y: 10, z: 8 },
                            size: 2.8
                        },
                        {
                            id: 13,
                            title: "AI in Healthcare",
                            description: "Revolutionary applications of AI in medical diagnosis and treatment",
                            quotes: ["AI can detect diseases earlier than human doctors in many cases"],
                            position: { x: 8, y: -12, z: 16 },
                            size: 2.5
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Digital Transformation Trends",
                    description: "Analysis of emerging digital technologies and their adoption patterns across different business sectors",
                    quotes: [
                        "Digital transformation is no longer optional for businesses",
                        "Cloud computing has democratized access to powerful technologies",
                        "Remote work technologies are reshaping workplace dynamics"
                    ],
                    position: { x: 35, y: 5, z: 25 },
                    size: 5,
                    subtopics: [
                        {
                            id: 21,
                            title: "Cloud Computing Evolution",
                            description: "The shift from on-premise to cloud-first architectures",
                            quotes: ["The cloud is becoming the default platform for innovation"],
                            position: { x: 50, y: 15, z: 35 },
                            size: 2.3
                        },
                        {
                            id: 22,
                            title: "Cybersecurity Challenges",
                            description: "New security threats in an increasingly digital world",
                            quotes: ["With great connectivity comes great security responsibility"],
                            position: { x: 45, y: -8, z: 15 },
                            size: 2.6
                        }
                    ]
                },
                {
                    id: 3,
                    title: "Sustainable Technology Solutions",
                    description: "Exploring how technology can address climate change and environmental challenges through innovation",
                    quotes: [
                        "Green technology is becoming economically viable at scale",
                        "Renewable energy costs have plummeted dramatically",
                        "Smart cities can reduce carbon emissions by up to 30%"
                    ],
                    position: { x: -30, y: -8, z: 20 },
                    size: 4.5,
                    subtopics: [
                        {
                            id: 31,
                            title: "Renewable Energy Tech",
                            description: "Advances in solar, wind, and battery storage technologies",
                            quotes: ["Solar panels are now the cheapest source of electricity in history"],
                            position: { x: -45, y: -18, z: 35 },
                            size: 2.4
                        },
                        {
                            id: 32,
                            title: "Carbon Capture Innovation",
                            description: "Breakthrough technologies for removing CO2 from atmosphere",
                            quotes: ["Direct air capture could be a game-changer for climate goals"],
                            position: { x: -15, y: -20, z: 8 },
                            size: 2.2
                        }
                    ]
                },
                {
                    id: 4,
                    title: "Future of Work and Education",
                    description: "How technological advancement is reshaping career paths, skill requirements, and learning methodologies",
                    quotes: [
                        "The half-life of skills is shrinking rapidly",
                        "Lifelong learning is becoming essential for career survival",
                        "Remote collaboration tools are changing team dynamics"
                    ],
                    position: { x: 15, y: 25, z: -30 },
                    size: 4.8,
                    subtopics: [
                        {
                            id: 41,
                            title: "Skill-Based Hiring",
                            description: "Movement away from degree requirements toward competency assessment",
                            quotes: ["Companies are prioritizing skills over credentials"],
                            position: { x: 30, y: 35, z: -45 },
                            size: 2.3
                        },
                        {
                            id: 42,
                            title: "Virtual Reality Learning",
                            description: "Immersive technologies transforming educational experiences",
                            quotes: ["VR can provide hands-on experience without real-world risks"],
                            position: { x: 5, y: 40, z: -15 },
                            size: 2.1
                        }
                    ]
                }
            ]
        };
        
        this.createVisualization(demoTopics);
        console.log('Demo visualization created with', demoTopics.mainTopics.length, 'detailed topics');
    }

    setupControls() {
        let isDragging = false;
        let dragStarted = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStarted = false;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };
                
                if (Math.abs(deltaMove.x) > 5 || Math.abs(deltaMove.y) > 5) {
                    dragStarted = true;
                }
                
                this.scene.rotation.y += deltaMove.x * 0.01;
                this.scene.rotation.x += deltaMove.y * 0.01;
                
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.renderer.domElement.addEventListener('wheel', (e) => {
            const delta = e.deltaY;
            this.camera.position.z += delta * 0.1;
            this.camera.position.z = Math.max(10, Math.min(200, this.camera.position.z));
        });
        
        this.renderer.domElement.addEventListener('click', (e) => {
            if (!dragStarted) {
                this.onTopicClick(e);
            }
        });
    }

    setupEventListeners() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const transcriptInput = document.getElementById('transcriptInput');
        const closeInfo = document.getElementById('closeInfo');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                console.log('Analyze button clicked!');
                this.analyzePodcast();
            });
        }
        
        if (closeInfo) {
            closeInfo.addEventListener('click', () => this.hideTopicInfo());
        }
        
        if (transcriptInput) {
            transcriptInput.addEventListener('input', (e) => {
                const charCount = e.target.value.length;
                const charCountEl = document.getElementById('charCount');
                if (charCountEl) {
                    charCountEl.textContent = charCount.toLocaleString();
                }
            });
        }
    }

    async analyzePodcast() {
        if (this.isAnalyzing) return;
        
        const transcript = document.getElementById('transcriptInput').value.trim();
        
        if (!transcript) {
            this.updateStatus('Please paste your transcript in the text area', 'error');
            return;
        }
        
        if (transcript.length < 200) {
            this.updateStatus('Transcript too short. Please provide at least 200 characters for meaningful analysis.', 'error');
            return;
        }
        
        this.isAnalyzing = true;
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<div class="loading"></div>Analyzing Topics...';
        }
        
        try {
            this.clearVisualization();
            this.updateStatus(`Analyzing ${transcript.length} characters with AI...`, 'info');
            
            console.log('Sending request to server...');
            console.log('Transcript preview:', transcript.substring(0, 100) + '...');
            
            const analysisResponse = await fetch('http://localhost:3001/api/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ transcript })
            });
            
            console.log('Response status:', analysisResponse.status);
            
            if (!analysisResponse.ok) {
                const errorText = await analysisResponse.text();
                console.error('Server error response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (parseError) {
                    console.error('Could not parse error response as JSON:', parseError);
                    throw new Error(`Server error (${analysisResponse.status}): ${errorText}`);
                }
                
                throw new Error(errorData.error || `HTTP ${analysisResponse.status}`);
            }
            
            const responseText = await analysisResponse.text();
            console.log('Raw response:', responseText);
            
            let analysis;
            try {
                analysis = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                console.error('Response text:', responseText);
                
                this.createFallbackVisualization(transcript);
                this.updateStatus('✅ Created basic visualization (AI analysis failed)', 'success');
                return;
            }
            
            console.log('Parsed analysis:', analysis);
            
            if (!analysis.mainTopics || analysis.mainTopics.length === 0) {
                console.warn('No topics in analysis, creating fallback');
                this.createFallbackVisualization(transcript);
                this.updateStatus('✅ Created basic visualization (no topics found)', 'success');
                return;
            }
            
            this.createVisualization(analysis);
            this.updateStatus(`✅ Found ${analysis.mainTopics.length} topics! Click bubbles to explore.`, 'success');
            
        } catch (error) {
            console.error('Analysis error:', error);
            console.error('Error stack:', error.stack);
            
            try {
                this.createFallbackVisualization(transcript);
                this.updateStatus(`⚠️ Created basic visualization (${error.message})`, 'success');
            } catch (fallbackError) {
                console.error('Fallback visualization failed:', fallbackError);
                this.updateStatus(`❌ ${error.message}`, 'error');
            }
        } finally {
            this.isAnalyzing = false;
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '✨ Analyze Topics';
            }
        }
    }
    
    createFallbackVisualization(transcript) {
        console.log('Creating fallback visualization...');
        
        const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const words = transcript.toLowerCase().split(/\s+/);
        
        const wordCount = {};
        const stopWords = new Set(['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'very', 'what', 'know', 'just', 'can', 'think', 'really', 'like', 'now', 'going', 'want', 'way', 'come', 'people', 'things', 'good', 'right']);
        
        words.forEach(word => {
            const clean = word.replace(/[^\w]/g, '').toLowerCase();
            if (clean.length > 3 && !stopWords.has(clean)) {
                wordCount[clean] = (wordCount[clean] || 0) + 1;
            }
        });
        
        const topWords = Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 9)
            .map(([word]) => word);
        
        const fallbackAnalysis = {
            mainTopics: [
                {
                    id: 1,
                    title: `Main Discussion`,
                    description: `Primary topics: ${topWords.slice(0, 3).join(', ')}`,
                    quotes: [sentences[0] || transcript.substring(0, 100) + '...'],
                    position: { x: 0, y: 0, z: 0 },
                    size: 4,
                    subtopics: []
                },
                {
                    id: 2,
                    title: `Key Points`,
                    description: `Important aspects: ${topWords.slice(3, 6).join(', ')}`,
                    quotes: [sentences[Math.floor(sentences.length / 2)] || transcript.substring(transcript.length / 2, transcript.length / 2 + 100) + '...'],
                    position: { x: 25, y: 5, z: 15 },
                    size: 3.5,
                    subtopics: []
                },
                {
                    id: 3,
                    title: `Final Thoughts`,
                    description: `Concluding ideas: ${topWords.slice(6, 9).join(', ')}`,
                    quotes: [sentences[sentences.length - 1] || transcript.substring(transcript.length - 150)],
                    position: { x: -20, y: -5, z: 20 },
                    size: 3,
                    subtopics: []
                }
            ]
        };
        
        console.log('Fallback analysis created:', fallbackAnalysis);
        this.createVisualization(fallbackAnalysis);
    }

    updateStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-${type}`;
        }
    }

    createVisualization(analysis) {
        console.log('Creating visualization with analysis:', analysis);
        
        this.clearVisualization();
        
        if (!analysis || !analysis.mainTopics) {
            console.error('Invalid analysis data:', analysis);
            return;
        }
        
        this.topics = analysis.mainTopics;
        console.log('Processing', this.topics.length, 'topics');
        
        this.topics.forEach((topic, index) => {
            console.log(`Creating topic bubble ${index + 1}:`, topic.title);
            this.createTopicBubble(topic, index);
            
            if (topic.subtopics && topic.subtopics.length > 0) {
                console.log(`Creating ${topic.subtopics.length} subtopics for`, topic.title);
                topic.subtopics.forEach((subtopic, subIndex) => {
                    this.createSubtopicBubble(subtopic, topic, subIndex);
                });
            }
        });
        
        console.log('Visualization created successfully!');
        console.log('Total meshes in scene:', this.topicMeshes.length);
    }
    
    createTopicBubble(topic, index) {
        const size = Math.max(topic.size || 4, 3); // Ensure minimum size for visibility
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        // More sophisticated color scheme based on topic importance
        const colorSchemes = [
            { primary: 0xff6b6b, secondary: 0xff8e8e }, // Red theme
            { primary: 0x4ecdc4, secondary: 0x7ed7d1 }, // Teal theme  
            { primary: 0x45b7d1, secondary: 0x6bc5da }, // Blue theme
            { primary: 0xf9ca24, secondary: 0xfbd46a }, // Yellow theme
            { primary: 0x6c5ce7, secondary: 0x8b7bee }, // Purple theme
            { primary: 0xa55eea, secondary: 0xb983f0 }, // Pink theme
            { primary: 0x26de81, secondary: 0x58e49a }, // Green theme
            { primary: 0xfd79a8, secondary: 0xfe9bb8 }  // Rose theme
        ];
        
        const colorScheme = colorSchemes[index % colorSchemes.length];
        
        const material = new THREE.MeshPhongMaterial({
            color: colorScheme.primary,
            transparent: true,
            opacity: 0.85,
            shininess: 120,
            specular: 0x444444
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        
        // Enhanced positioning with better spacing
        if (topic.position) {
            sphere.position.set(topic.position.x, topic.position.y, topic.position.z);
        } else {
            const angle = (index / this.topics.length) * Math.PI * 2;
            const radius = 40 + (index * 5); // Varied radius for visual interest
            sphere.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 25,
                Math.sin(angle) * radius
            );
        }
        
        console.log(`Topic "${topic.title}" positioned at:`, sphere.position);
        
        // Enhanced wireframe with topic-specific styling
        const wireframe = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: colorScheme.secondary, 
            transparent: true, 
            opacity: 0.4 
        });
        const wireframeLines = new THREE.LineSegments(wireframe, wireframeMaterial);
        wireframeLines.position.copy(sphere.position);
        this.scene.add(wireframeLines);
        this.topicMeshes.push(wireframeLines);
        
        // Create detailed floating label with description preview
        this.createDetailedTopicLabel(topic, sphere.position, size);
        
        // Add subtle glow effect
        const glowGeometry = new THREE.SphereGeometry(size * 1.15, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: colorScheme.secondary,
            transparent: true,
            opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(sphere.position);
        this.scene.add(glow);
        this.topicMeshes.push(glow);
        
        sphere.userData = { 
            topic, 
            type: 'main',
            originalColor: new THREE.Color(colorScheme.primary),
            originalOpacity: 0.85,
            colorScheme,
            glow
        };
        
        this.scene.add(sphere);
        this.topicMeshes.push(sphere);
        
        // Enhanced animation properties
        sphere.userData.originalPosition = sphere.position.clone();
        sphere.userData.animationOffset = Math.random() * Math.PI * 2;
        sphere.userData.animationSpeed = 0.3 + Math.random() * 0.3; // Slower, more elegant movement
        sphere.userData.rotationSpeed = 0.002 + Math.random() * 0.003;
        
        console.log(`Detailed topic bubble created for "${topic.title}"`);
    }
    
    createSubtopicBubble(subtopic, parentTopic, index) {
        const size = Math.max(subtopic.size || 2.5, 1.5);
        const geometry = new THREE.SphereGeometry(size, 20, 20);
        
        // Derive color scheme from parent topic
        const parentMesh = this.topicMeshes.find(mesh => mesh.userData && mesh.userData.topic === parentTopic);
        const parentColorScheme = parentMesh?.userData?.colorScheme || { primary: 0x87ceeb, secondary: 0xa5d6f0 };
        
        // Create complementary colors for subtopics
        const hsl = {};
        const parentColor = new THREE.Color(parentColorScheme.primary);
        parentColor.getHSL(hsl);
        
        // Shift hue slightly and adjust saturation/lightness
        const subtopicHue = (hsl.h + (index * 0.1)) % 1;
        const subtopicColor = new THREE.Color().setHSL(subtopicHue, hsl.s * 0.8, hsl.l * 1.1);
        
        const material = new THREE.MeshPhongMaterial({
            color: subtopicColor,
            transparent: true,
            opacity: 0.75,
            shininess: 80
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        
        // Smart positioning around parent
        let parentPos = parentTopic.position || { x: 0, y: 0, z: 0 };
        if (parentMesh) {
            parentPos = parentMesh.position;
        }
        
        // Create orbital positioning around parent
        const angle = (index / (parentTopic.subtopics?.length || 1)) * Math.PI * 2;
        const distance = 15 + (size * 3) + (index * 2); // Dynamic distance based on size
        const heightOffset = Math.sin(angle * 2) * 6; // Vertical variation for visual interest
        
        if (subtopic.position) {
            sphere.position.set(subtopic.position.x, subtopic.position.y, subtopic.position.z);
        } else {
            sphere.position.set(
                parentPos.x + Math.cos(angle) * distance,
                parentPos.y + heightOffset + (Math.random() - 0.5) * 4,
                parentPos.z + Math.sin(angle) * distance
            );
        }
        
        // Enhanced connection line with curve
        if (parentMesh) {
            const curve = new THREE.QuadraticBezierCurve3(
                parentMesh.position.clone(),
                new THREE.Vector3(
                    (parentMesh.position.x + sphere.position.x) / 2,
                    Math.max(parentMesh.position.y, sphere.position.y) + 8,
                    (parentMesh.position.z + sphere.position.z) / 2
                ),
                sphere.position.clone()
            );
            
            const points = curve.getPoints(20);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: subtopicColor,
                transparent: true,
                opacity: 0.6,
                linewidth: 2
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            this.topicMeshes.push(line);
        }
        
        // Create detailed subtopic label
        this.createSubtopicLabel(subtopic, sphere.position, size);
        
        // Subtle pulse effect for subtopics
        const pulseGeometry = new THREE.SphereGeometry(size * 1.1, 12, 12);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: subtopicColor,
            transparent: true,
            opacity: 0.1
        });
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.copy(sphere.position);
        this.scene.add(pulse);
        this.topicMeshes.push(pulse);
        
        sphere.userData = { 
            topic: subtopic, 
            type: 'sub', 
            parent: parentTopic,
            originalColor: subtopicColor.clone(),
            originalOpacity: 0.75,
            pulse
        };
        
        this.scene.add(sphere);
        this.topicMeshes.push(sphere);
        
        // Enhanced animation for subtopics
        sphere.userData.originalPosition = sphere.position.clone();
        sphere.userData.animationOffset = Math.random() * Math.PI * 2;
        sphere.userData.animationSpeed = 0.4 + Math.random() * 0.4;
        sphere.userData.orbitSpeed = 0.001 + Math.random() * 0.002;
        sphere.userData.orbitRadius = distance;
        sphere.userData.orbitAngle = angle;
        
        console.log(`Detailed subtopic bubble created for "${subtopic.title}"`);
    }
    
    createDetailedTopicLabel(topic, position, scale = 1) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = 600;
        canvas.height = 200;
        
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(50, 50, 100, 0.9)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border with rounded corners
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        context.lineWidth = 3;
        context.beginPath();
        context.roundRect(5, 5, canvas.width - 10, canvas.height - 10, 10);
        context.stroke();
        
        // Title
        context.fillStyle = 'white';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.fillText(topic.title, canvas.width / 2, 50);
        
        // Description (truncated)
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '20px Arial';
        const description = topic.description.length > 60 ? topic.description.substring(0, 60) + '...' : topic.description;
        
        // Word wrap description
        const words = description.split(' ');
        let line = '';
        let y = 90;
        const maxWidth = canvas.width - 40;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                context.fillText(line, canvas.width / 2, y);
                line = words[i] + ' ';
                y += 25;
                if (y > 160) break; // Prevent overflow
            } else {
                line = testLine;
            }
        }
        context.fillText(line, canvas.width / 2, y);
        
        // Subtopic count indicator
        if (topic.subtopics && topic.subtopics.length > 0) {
            context.fillStyle = 'rgba(255, 215, 0, 0.9)';
            context.font = 'bold 18px Arial';
            context.fillText(`${topic.subtopics.length} subtopics`, canvas.width / 2, canvas.height - 20);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(15 * scale, 5 * scale, 1);
        sprite.position.set(position.x, position.y + (scale * 8), position.z);
        
        this.scene.add(sprite);
        this.topicMeshes.push(sprite);
        
        return sprite;
    }
    
    createSubtopicLabel(subtopic, position, scale = 1) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 120;
        
        // Subtopic-specific styling
        context.fillStyle = 'rgba(30, 30, 60, 0.85)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.strokeStyle = 'rgba(200, 200, 255, 0.7)';
        context.lineWidth = 2;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // Title
        context.fillStyle = 'white';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(subtopic.title, canvas.width / 2, 30);
        
        // Description
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        context.font = '16px Arial';
        const desc = subtopic.description.length > 40 ? subtopic.description.substring(0, 40) + '...' : subtopic.description;
        context.fillText(desc, canvas.width / 2, 60);
        
        // Quote indicator
        if (subtopic.quotes && subtopic.quotes.length > 0) {
            context.fillStyle = 'rgba(255, 255, 0, 0.8)';
            context.font = '12px Arial';
            context.fillText('💬 Click for quotes', canvas.width / 2, 90);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(8 * scale, 2.4 * scale, 1);
        sprite.position.set(position.x, position.y + (scale * 4), position.z);
        
        this.scene.add(sprite);
        this.topicMeshes.push(sprite);
        
        return sprite;
    }

    onTopicClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const clickableObjects = this.topicMeshes.filter(mesh => 
            mesh.userData && mesh.userData.topic && mesh.geometry && mesh.geometry.type === 'SphereGeometry'
        );
        
        const intersects = this.raycaster.intersectObjects(clickableObjects);
        
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const selectedTopic = selectedMesh.userData.topic;
            
            console.log('Topic clicked:', selectedTopic.title);
            
            this.showTopicInfo(selectedTopic);
            this.highlightTopic(selectedMesh);
        }
    }
    
    highlightTopic(selectedMesh) {
        this.topicMeshes.forEach(mesh => {
            if (mesh.userData && mesh.userData.originalColor && mesh.material) {
                mesh.material.color.copy(mesh.userData.originalColor);
                mesh.material.opacity = mesh.userData.originalOpacity;
            }
        });
        
        if (selectedMesh.material) {
            selectedMesh.material.color.setRGB(1, 1, 1);
            selectedMesh.material.opacity = 1;
            selectedMesh.material.emissive.setRGB(0.2, 0.2, 0.2);
        }
    }
    
    showTopicInfo(topic) {
        const topicInfo = document.getElementById('topicInfo');
        const title = document.getElementById('topicTitle');
        const description = document.getElementById('topicDescription');
        const quotes = document.getElementById('topicQuotes');
        
        if (!topicInfo || !title || !description || !quotes) {
            console.error('Topic info elements not found');
            return;
        }
        
        title.textContent = topic.title || 'Topic';
        description.textContent = topic.description || 'No description available';
        
        quotes.innerHTML = '';
        
        if (topic.quotes && topic.quotes.length > 0) {
            topic.quotes.forEach((quote, index) => {
                const quoteDiv = document.createElement('div');
                quoteDiv.className = 'quote';
                quoteDiv.textContent = `"${quote}"`;
                quotes.appendChild(quoteDiv);
            });
        }
        
        if (topic.subtopics && topic.subtopics.length > 0) {
            const subtopicsHeader = document.createElement('h4');
            subtopicsHeader.textContent = 'Subtopics:';
            subtopicsHeader.style.marginTop = '15px';
            subtopicsHeader.style.color = '#667eea';
            quotes.appendChild(subtopicsHeader);
            
            topic.subtopics.forEach(subtopic => {
                const subtopicDiv = document.createElement('div');
                subtopicDiv.style.background = '#f0f8ff';
                subtopicDiv.style.padding = '8px';
                subtopicDiv.style.margin = '5px 0';
                subtopicDiv.style.borderRadius = '4px';
                subtopicDiv.style.borderLeft = '3px solid #87ceeb';
                subtopicDiv.innerHTML = `
                    <strong>${subtopic.title}</strong><br>
                    <small>${subtopic.description}</small>
                    ${subtopic.quotes ? '<br><em>"' + subtopic.quotes[0] + '"</em>' : ''}
                `;
                quotes.appendChild(subtopicDiv);
            });
        }
        
        topicInfo.style.display = 'block';
        console.log('Topic info displayed for:', topic.title);
    }

    hideTopicInfo() {
        const topicInfo = document.getElementById('topicInfo');
        if (topicInfo) {
            topicInfo.style.display = 'none';
        }
    }

    clearVisualization() {
        console.log('Clearing visualization...');
        this.topicMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            }
        });
        this.topicMeshes = [];
        this.topics = [];
        console.log('Visualization cleared');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        this.topicMeshes.forEach(mesh => {
            if (mesh.userData && mesh.userData.originalPosition) {
                const speed = mesh.userData.animationSpeed || 1;
                const offset = mesh.userData.animationOffset || 0;
                
                // Enhanced floating motion
                mesh.position.y = mesh.userData.originalPosition.y + 
                    Math.sin(time * speed + offset) * 2 +
                    Math.cos(time * speed * 0.5 + offset) * 1;
                
                // Main topic animations
                if (mesh.userData.type === 'main') {
                    mesh.rotation.y += mesh.userData.rotationSpeed || 0.005;
                    
                    // Animate glow effect
                    if (mesh.userData.glow) {
                        mesh.userData.glow.position.copy(mesh.position);
                        mesh.userData.glow.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
                    }
                }
                
                // Subtopic orbital motion
                if (mesh.userData.type === 'sub' && mesh.userData.parent) {
                    const parentMesh = this.topicMeshes.find(m => m.userData && m.userData.topic === mesh.userData.parent);
                    if (parentMesh) {
                        mesh.userData.orbitAngle += mesh.userData.orbitSpeed || 0.001;
                        const radius = mesh.userData.orbitRadius || 15;
                        
                        mesh.position.x = parentMesh.position.x + Math.cos(mesh.userData.orbitAngle) * radius;
                        mesh.position.z = parentMesh.position.z + Math.sin(mesh.userData.orbitAngle) * radius;
                    }
                    
                    // Animate pulse effect
                    if (mesh.userData.pulse) {
                        mesh.userData.pulse.position.copy(mesh.position);
                        mesh.userData.pulse.material.opacity = 0.05 + Math.sin(time * 3) * 0.05;
                        mesh.userData.pulse.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
                    }
                }
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the visualizer and make it globally accessible
console.log('Initializing podcast visualizer...');
const visualizer = new PodcastVisualizer();
window.visualizer = visualizer;

// Handle window resize
window.addEventListener('resize', () => visualizer.handleResize());
