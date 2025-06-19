import * as THREE from 'three';

class PodcastVisualizer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 400) / window.innerHeight, 0.1, 1000);
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
        // Setup renderer with proper dimensions
        const width = window.innerWidth - 400;
        const height = window.innerHeight;
        
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x0f1419, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('visualizationContainer');
        if (container) {
            container.appendChild(this.renderer.domElement);
        } else {
            console.error('Visualization container not found');
            return;
        }
        
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
        
        // Add stars background
        this.createStarField();
        
        // Setup controls
        this.setupControls();
        
        // Start render loop
        this.animate();
        
        // Test server connection
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
                    title: "Machine Learning Applications",
                    description: "Real-world applications of machine learning in various industries including healthcare, finance, and autonomous vehicles",
                    quotes: [
                        "Machine learning is transforming how we diagnose diseases in healthcare",
                        "Autonomous vehicles rely heavily on deep learning algorithms",
                        "Financial institutions use ML for fraud detection and risk assessment"
                    ],
                    keywords: ["machine learning", "applications", "healthcare", "finance"],
                    position: { x: 0, y: 0, z: 0 },
                    size: 5,
                    subtopics: [
                        {
                            id: 11,
                            title: "Healthcare AI",
                            description: "AI applications in medical diagnosis and treatment",
                            quotes: ["AI can detect cancer earlier than human radiologists"],
                            position: { x: 18, y: 8, z: -12 },
                            size: 2.5
                        },
                        {
                            id: 12,
                            title: "Financial ML",
                            description: "Machine learning in banking and trading",
                            quotes: ["Algorithmic trading processes millions of transactions per second"],
                            position: { x: -15, y: 10, z: 8 },
                            size: 2.3
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Blockchain Technology",
                    description: "Distributed ledger technology, cryptocurrencies, and smart contracts revolutionizing digital transactions",
                    quotes: [
                        "Blockchain provides immutable record keeping",
                        "Smart contracts automate complex business processes",
                        "Decentralized finance is disrupting traditional banking"
                    ],
                    keywords: ["blockchain", "cryptocurrency", "smart contracts", "defi"],
                    position: { x: 35, y: 5, z: 25 },
                    size: 4.5,
                    subtopics: [
                        {
                            id: 21,
                            title: "Smart Contracts",
                            description: "Self-executing contracts with terms directly written into code",
                            quotes: ["Smart contracts eliminate the need for intermediaries"],
                            position: { x: 50, y: 15, z: 35 },
                            size: 2.2
                        }
                    ]
                },
                {
                    id: 3,
                    title: "Quantum Computing",
                    description: "Revolutionary computing paradigm using quantum mechanical phenomena to process information",
                    quotes: [
                        "Quantum computers could break current encryption methods",
                        "Google achieved quantum supremacy in 2019",
                        "Quantum algorithms could revolutionize drug discovery"
                    ],
                    keywords: ["quantum", "computing", "algorithms", "supremacy"],
                    position: { x: -30, y: -8, z: 20 },
                    size: 4,
                    subtopics: [
                        {
                            id: 31,
                            title: "Quantum Algorithms",
                            description: "Specialized algorithms designed for quantum computers",
                            quotes: ["Shor's algorithm can factor large numbers exponentially faster"],
                            position: { x: -45, y: -18, z: 35 },
                            size: 2.1
                        }
                    ]
                }
            ]
        };
        
        this.createVisualization(demoTopics);
        console.log('Demo visualization created with', demoTopics.mainTopics.length, 'topics');
    }

    setupControls() {
        let isDragging = false;
        let dragStarted = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStarted = false;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mousemove', (e) => {
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
            } else {
                // Handle hover when not dragging
                this.onTopicHover(e);
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('wheel', (e) => {
            const delta = e.deltaY;
            this.camera.position.z += delta * 0.1;
            this.camera.position.z = Math.max(10, Math.min(200, this.camera.position.z));
        });
        
        canvas.addEventListener('click', (e) => {
            if (!dragStarted) {
                this.onTopicClick(e);
            }
        });
        
        // Add mouse leave event to reset hover state
        canvas.addEventListener('mouseleave', () => {
            this.resetHoverEffects();
        });
    }

    setupEventListeners() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const transcriptInput = document.getElementById('transcriptInput');
        const closeInfo = document.getElementById('closeInfo');
        const demoBtn = document.getElementById('demoBtn');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                console.log('Analyze button clicked!');
                this.analyzePodcast();
            });
        } else {
            console.error('Analyze button not found');
        }
        
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                console.log('Demo button clicked!');
                this.updateStatus('🎮 Creating demo visualization...', 'info');
                this.createDemoVisualization();
            });
        } else {
            console.error('Demo button not found');
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
                    
                    // Update color based on length
                    if (charCount < 200) {
                        charCountEl.style.color = '#dc2626';
                    } else if (charCount < 500) {
                        charCountEl.style.color = '#d97706';
                    } else {
                        charCountEl.style.color = '#059669';
                    }
                }
            });
        }
    }

    async analyzePodcast() {
        if (this.isAnalyzing) return;
        
        const transcriptInput = document.getElementById('transcriptInput');
        if (!transcriptInput) {
            console.error('Transcript input not found');
            return;
        }
        
        const transcript = transcriptInput.value.trim();
        
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
            this.updateStatus('Analyzing ' + transcript.length + ' characters with AI...', 'info');
            
            console.log('Sending request to server...');
            
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
                    throw new Error('Server error (' + analysisResponse.status + '): ' + errorText);
                }
                
                throw new Error(errorData.error || 'HTTP ' + analysisResponse.status);
            }
            
            const responseText = await analysisResponse.text();
            console.log('Raw response:', responseText.substring(0, 200) + '...');
            
            let analysis;
            try {
                analysis = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                this.createFallbackVisualization(transcript);
                this.updateStatus('✅ Created visualization using content analysis', 'success');
                return;
            }
            
            console.log('Parsed analysis:', analysis);
            
            if (!analysis.mainTopics || analysis.mainTopics.length === 0) {
                console.warn('No topics in analysis, creating fallback');
                this.createFallbackVisualization(transcript);
                this.updateStatus('✅ Created visualization using content analysis', 'success');
                return;
            }
            
            this.createVisualization(analysis);
            this.updateStatus('✅ Found ' + analysis.mainTopics.length + ' topics! Click bubbles to explore.', 'success');
            
        } catch (error) {
            console.error('Analysis error:', error);
            
            try {
                this.createFallbackVisualization(transcript);
                this.updateStatus('⚠️ Created basic visualization (' + error.message + ')', 'success');
            } catch (fallbackError) {
                console.error('Fallback visualization failed:', fallbackError);
                this.updateStatus('❌ ' + error.message, 'error');
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
        console.log('Creating intelligent fallback visualization...');
        
        const topics = this.extractMeaningfulTopics(transcript);
        const fallbackAnalysis = { mainTopics: topics };
        
        console.log('Intelligent fallback analysis created:', fallbackAnalysis);
        this.createVisualization(fallbackAnalysis);
    }
    
    extractMeaningfulTopics(transcript) {
        const words = transcript.toLowerCase().split(/\s+/);
        const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        const stopWords = new Set([
            'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'very', 'what', 'know', 'just', 'can', 'think', 'really', 'like', 'now', 'going', 'want', 'way', 'come', 'people', 'things', 'good', 'right', 'podcast', 'episode', 'today', 'welcome', 'thanks', 'thank', 'guest', 'host', 'show', 'talk', 'discuss', 'conversation', 'interview'
        ]);
        
        const termContext = {};
        words.forEach((word, index) => {
            const clean = word.replace(/[^\w]/g, '').toLowerCase();
            if (clean.length > 4 && !stopWords.has(clean)) {
                if (!termContext[clean]) {
                    termContext[clean] = { count: 0, contexts: [] };
                }
                termContext[clean].count++;
                
                const contextStart = Math.max(0, index - 3);
                const contextEnd = Math.min(words.length, index + 4);
                const context = words.slice(contextStart, contextEnd).join(' ');
                termContext[clean].contexts.push(context);
            }
        });
        
        const topTerms = Object.entries(termContext)
            .filter(([term, data]) => data.count >= 2)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 12)
            .map(([term, data]) => ({ term, ...data }));
        
        const topics = [];
        
        for (let i = 0; i < Math.min(4, Math.ceil(topTerms.length / 3)); i++) {
            const startIdx = i * 3;
            const topicTerms = topTerms.slice(startIdx, startIdx + 3);
            
            if (topicTerms.length === 0) break;
            
            const primaryTerm = topicTerms[0];
            const relatedTerms = topicTerms.slice(1).map(t => t.term);
            
            const relevantSentences = sentences.filter(sentence => 
                sentence.toLowerCase().includes(primaryTerm.term)
            );
            
            const angle = (i / 4) * Math.PI * 2;
            const radius = 30 + (i * 8);
            
            topics.push({
                id: i + 1,
                title: this.generateTopicTitle(primaryTerm.term, relatedTerms),
                description: this.generateTopicDescription(primaryTerm.term, relatedTerms, primaryTerm.count),
                quotes: relevantSentences.slice(0, 2).map(s => s.trim() + '...'),
                keywords: [primaryTerm.term].concat(relatedTerms),
                position: {
                    x: Math.cos(angle) * radius,
                    y: (Math.random() - 0.5) * 15,
                    z: Math.sin(angle) * radius
                },
                size: 3.5 + (primaryTerm.count / 10),
                subtopics: this.generateSubtopics(primaryTerm, relatedTerms, relevantSentences, angle, radius)
            });
        }
        
        return topics.length > 0 ? topics : this.createGenericTopics(transcript);
    }
    
    generateTopicTitle(primaryTerm, relatedTerms) {
        const title = primaryTerm.charAt(0).toUpperCase() + primaryTerm.slice(1);
        
        if (relatedTerms.length > 0) {
            return title + ' & ' + relatedTerms[0].charAt(0).toUpperCase() + relatedTerms[0].slice(1);
        }
        
        return title;
    }
    
    generateTopicDescription(primaryTerm, relatedTerms, frequency) {
        const related = relatedTerms.length > 0 ? ', including ' + relatedTerms.join(', ') : '';
        return 'Discussion about ' + primaryTerm + related + '. Mentioned ' + frequency + ' times throughout the conversation.';
    }
    
    generateSubtopics(primaryTerm, relatedTerms, sentences, parentAngle, parentRadius) {
        if (relatedTerms.length === 0) return [];
        
        return relatedTerms.slice(0, 2).map((term, index) => {
            const relevantSentence = sentences.find(s => s.toLowerCase().includes(term)) || 
                                   'Discussion about ' + term + ' in relation to ' + primaryTerm.term;
            
            const subAngle = parentAngle + (index * 0.5);
            const subRadius = parentRadius + 15;
            
            return {
                id: parseInt(primaryTerm.term.length.toString() + (index + 1).toString()),
                title: term.charAt(0).toUpperCase() + term.slice(1),
                description: 'Specific aspects of ' + term + ' discussed in the conversation',
                quotes: [relevantSentence.trim() + '...'],
                position: {
                    x: Math.cos(subAngle) * subRadius,
                    y: (Math.random() - 0.5) * 8,
                    z: Math.sin(subAngle) * subRadius
                },
                size: 2
            };
        });
    }
    
    createGenericTopics(transcript) {
        const sections = this.splitIntoSections(transcript);
        
        return sections.map((section, index) => ({
            id: index + 1,
            title: 'Discussion Topic ' + (index + 1),
            description: 'Key points from section ' + (index + 1) + ' of the conversation',
            quotes: [section.substring(0, 100) + '...'],
            position: {
                x: Math.cos((index / sections.length) * Math.PI * 2) * 25,
                y: (Math.random() - 0.5) * 10,
                z: Math.sin((index / sections.length) * Math.PI * 2) * 25
            },
            size: 3.5,
            subtopics: []
        }));
    }
    
    splitIntoSections(transcript) {
        const sectionLength = Math.ceil(transcript.length / 3);
        return [
            transcript.substring(0, sectionLength),
            transcript.substring(sectionLength, sectionLength * 2),
            transcript.substring(sectionLength * 2)
        ].filter(section => section.trim().length > 0);
    }

    updateStatus(message, type) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'status-' + type;
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
        
        this.displayTopicsPanel(this.topics);
        
        this.topics.forEach((topic, index) => {
            console.log('Creating topic bubble ' + (index + 1) + ':', topic.title);
            this.createTopicBubble(topic, index);
            
            if (topic.subtopics && topic.subtopics.length > 0) {
                console.log('Creating ' + topic.subtopics.length + ' subtopics for', topic.title);
                topic.subtopics.forEach((subtopic, subIndex) => {
                    this.createSubtopicBubble(subtopic, topic, subIndex);
                });
            }
        });
        
        console.log('Visualization created successfully!');
        console.log('Total meshes in scene:', this.topicMeshes.length);
    }
    
    displayTopicsPanel(topics) {
        const topicsPanel = document.getElementById('topicsPanel');
        const topicsList = document.getElementById('topicsList');
        
        if (!topicsPanel || !topicsList) return;
        
        topicsList.innerHTML = '';
        
        topics.forEach(topic => {
            const topicItem = document.createElement('div');
            topicItem.className = 'topic-item';
            
            const description = topic.description.length > 80 ? 
                topic.description.substring(0, 80) + '...' : 
                topic.description;
            
            topicItem.innerHTML = '<h4>' + topic.title + '</h4><p>' + description + '</p>';
            topicsList.appendChild(topicItem);
        });
        
        topicsPanel.style.display = 'block';
    }

    createTopicBubble(topic, index) {
        const size = topic.size || 3;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        const colors = [
            0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 
            0x6c5ce7, 0xa55eea, 0x26de81, 0xfd79a8
        ];
        
        const color = colors[index % colors.length];
        
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        
        // Set position
        if (topic.position) {
            sphere.position.set(topic.position.x, topic.position.y, topic.position.z);
        } else {
            const angle = (index / this.topics.length) * Math.PI * 2;
            const radius = 30 + (index * 5);
            sphere.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 20,
                Math.sin(angle) * radius
            );
        }
        
        // Store original position for animation
        sphere.userData = { 
            topic: topic, 
            type: 'main',
            index: index,
            originalColor: new THREE.Color(color),
            originalOpacity: 0.8,
            originalPosition: sphere.position.clone(),
            isHovered: false
        };
        
        // Create floating label
        this.createFloatingLabel(topic.title || 'Topic ' + (index + 1), sphere.position, size);
        
        // Add glow effect for hover
        const glowGeometry = new THREE.SphereGeometry(size * 1.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(sphere.position);
        this.scene.add(glow);
        this.topicMeshes.push(glow);
        
        sphere.userData.glow = glow;
        
        this.scene.add(sphere);
        this.topicMeshes.push(sphere);
        
        console.log('Topic bubble created for "' + topic.title + '"');
    }
    
    createSubtopicBubble(subtopic, parentTopic, index) {
        const size = subtopic.size || 2;
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.7
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        
        // Position around parent
        const parentMesh = this.topicMeshes.find(mesh => mesh.userData && mesh.userData.topic === parentTopic);
        let parentPos = parentTopic.position || { x: 0, y: 0, z: 0 };
        
        if (parentMesh) {
            parentPos = parentMesh.position;
        }
        
        const angle = (index / (parentTopic.subtopics.length || 1)) * Math.PI * 2;
        const distance = 12 + index * 3;
        
        sphere.position.set(
            parentPos.x + Math.cos(angle) * distance,
            parentPos.y + (Math.random() - 0.5) * 8,
            parentPos.z + Math.sin(angle) * distance
        );
        
        // Create connection line
        let connectionLine = null;
        if (parentMesh) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                parentMesh.position.clone(),
                sphere.position.clone()
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0x87ceeb,
                transparent: true,
                opacity: 0.3
            });
            connectionLine = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(connectionLine);
            this.topicMeshes.push(connectionLine);
        }
        
        // Create floating label
        this.createFloatingLabel(subtopic.title || 'Subtopic ' + (index + 1), sphere.position, size * 0.7);
        
        // Add glow effect for subtopics
        const glowGeometry = new THREE.SphereGeometry(size * 1.2, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(sphere.position);
        this.scene.add(glow);
        this.topicMeshes.push(glow);
        
        sphere.userData = { 
            topic: subtopic, 
            type: 'sub', 
            parent: parentTopic,
            parentMesh: parentMesh,
            originalColor: new THREE.Color(0x87ceeb),
            originalOpacity: 0.7,
            originalPosition: sphere.position.clone(),
            glow: glow,
            connectionLine: connectionLine,
            isHovered: false
        };
        
        this.scene.add(sphere);
        this.topicMeshes.push(sphere);
        
        console.log('Subtopic bubble created for "' + subtopic.title + '"');
    }
    
    createFloatingLabel(text, position, scale) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = 512;
        canvas.height = 128;
        
        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        context.lineWidth = 2;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Text
        context.fillStyle = 'white';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Word wrap
        const maxWidth = canvas.width - 40;
        const words = text.split(' ');
        let line = '';
        const lines = [];
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        
        // Draw lines
        const lineHeight = 36;
        const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach(function(line, index) {
            context.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });
        
        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(10 * scale, 2.5 * scale, 1);
        sprite.position.set(position.x, position.y + 8, position.z);
        
        this.scene.add(sprite);
        this.topicMeshes.push(sprite);
        
        return sprite;
    }

    onTopicClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find objects with click detection (only spheres with topic data)
        const clickableObjects = this.topicMeshes.filter(function(mesh) {
            return mesh.userData && mesh.userData.topic && mesh.geometry && mesh.geometry.type === 'SphereGeometry';
        });
        
        console.log('Checking', clickableObjects.length, 'clickable objects');
        
        // Calculate intersections
        const intersects = this.raycaster.intersectObjects(clickableObjects);
        
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const selectedTopic = selectedMesh.userData.topic;
            
            console.log('Topic clicked:', selectedTopic.title);
            
            // Show topic information
            this.showTopicInfo(selectedTopic);
            
            // Highlight the selected topic
            this.highlightTopic(selectedMesh);
        } else {
            console.log('No topic clicked');
        }
    }
    
    onTopicHover(event) {
        // Calculate mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find hoverable objects
        const hoverableObjects = this.topicMeshes.filter(function(mesh) {
            return mesh.userData && mesh.userData.topic && mesh.geometry && mesh.geometry.type === 'SphereGeometry';
        });
        
        const intersects = this.raycaster.intersectObjects(hoverableObjects);
        
        // Reset all hover states first
        this.resetHoverEffects();
        
        if (intersects.length > 0) {
            const hoveredMesh = intersects[0].object;
            const hoveredTopic = hoveredMesh.userData.topic;
            
            // Change cursor
            document.body.style.cursor = 'pointer';
            
            // Apply hover effects
            this.applyHoverEffects(hoveredMesh);
            
            // Show preview tooltip
            this.showTopicPreview(hoveredTopic, event);
            
        } else {
            // Reset cursor
            document.body.style.cursor = 'default';
            this.hideTopicPreview();
        }
    }
    
    applyHoverEffects(hoveredMesh) {
        hoveredMesh.userData.isHovered = true;
        
        // Enhance hovered topic
        if (hoveredMesh.material) {
            hoveredMesh.material.opacity = 1;
            hoveredMesh.material.emissive.setRGB(0.1, 0.1, 0.1);
            
            // Scale up slightly
            hoveredMesh.scale.setScalar(1.2);
        }
        
        // Show glow effect
        if (hoveredMesh.userData.glow) {
            hoveredMesh.userData.glow.material.opacity = 0.4;
        }
        
        // Highlight related topics
        this.highlightRelatedTopics(hoveredMesh);
        
        // Show connection lines more prominently
        if (hoveredMesh.userData.connectionLine) {
            hoveredMesh.userData.connectionLine.material.opacity = 0.8;
            hoveredMesh.userData.connectionLine.material.color.setRGB(1, 1, 0); // Yellow highlight
        }
    }
    
    highlightRelatedTopics(hoveredMesh) {
        const hoveredTopic = hoveredMesh.userData.topic;
        
        this.topicMeshes.forEach(mesh => {
            if (mesh.userData && mesh.userData.topic && mesh !== hoveredMesh) {
                const isRelated = this.areTopicsRelated(hoveredTopic, mesh.userData.topic);
                
                if (isRelated) {
                    // Highlight related topics
                    if (mesh.material) {
                        mesh.material.opacity = 0.9;
                        mesh.material.emissive.setRGB(0.05, 0.05, 0.05);
                    }
                    if (mesh.userData.glow) {
                        mesh.userData.glow.material.opacity = 0.2;
                    }
                    if (mesh.userData.connectionLine) {
                        mesh.userData.connectionLine.material.opacity = 0.6;
                    }
                } else {
                    // Dim unrelated topics
                    if (mesh.material) {
                        mesh.material.opacity = 0.3;
                    }
                    if (mesh.userData.connectionLine) {
                        mesh.userData.connectionLine.material.opacity = 0.1;
                    }
                }
            }
        });
    }
    
    areTopicsRelated(topic1, topic2) {
        // Check if topics are parent-child related
        if (topic1.subtopics) {
            for (let subtopic of topic1.subtopics) {
                if (subtopic.id === topic2.id) return true;
            }
        }
        
        // Check if topic2 is parent of topic1
        if (topic2.subtopics) {
            for (let subtopic of topic2.subtopics) {
                if (subtopic.id === topic1.id) return true;
            }
        }
        
        // Check for keyword overlap
        if (topic1.keywords && topic2.keywords) {
            const overlap = topic1.keywords.some(keyword => 
                topic2.keywords.includes(keyword)
            );
            if (overlap) return true;
        }
        
        return false;
    }
    
    resetHoverEffects() {
        this.topicMeshes.forEach(mesh => {
            if (mesh.userData && mesh.userData.topic) {
                mesh.userData.isHovered = false;
                
                if (mesh.material) {
                    mesh.material.opacity = mesh.userData.originalOpacity || 0.8;
                    mesh.material.emissive.setRGB(0, 0, 0);
                    mesh.scale.setScalar(1);
                }
                
                if (mesh.userData.glow) {
                    mesh.userData.glow.material.opacity = 0;
                }
                
                if (mesh.userData.connectionLine) {
                    mesh.userData.connectionLine.material.opacity = 0.3;
                    mesh.userData.connectionLine.material.color.setRGB(0.53, 0.81, 0.92); // Original light blue
                }
            }
        });
        
        document.body.style.cursor = 'default';
        this.hideTopicPreview();
    }
    
    showTopicPreview(topic, event) {
        let preview = document.getElementById('topicPreview');
        
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'topicPreview';
            preview.style.position = 'fixed';
            preview.style.background = 'rgba(0, 0, 0, 0.95)';
            preview.style.color = 'white';
            preview.style.padding = '16px 20px';
            preview.style.borderRadius = '12px';
            preview.style.fontSize = '14px';
            preview.style.maxWidth = '320px';
            preview.style.zIndex = '1000';
            preview.style.pointerEvents = 'none';
            preview.style.fontFamily = 'Inter, sans-serif';
            preview.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
            preview.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            preview.style.backdropFilter = 'blur(10px)';
            preview.style.lineHeight = '1.4';
            document.body.appendChild(preview);
        }
        
        // Update content with rich preview
        let content = '<div style="font-weight: 600; font-size: 16px; color: #60a5fa; margin-bottom: 8px;">' + topic.title + '</div>';
        
        if (topic.description) {
            const shortDesc = topic.description.length > 120 ? 
                topic.description.substring(0, 120) + '...' : 
                topic.description;
            content += '<div style="color: #e5e7eb; font-size: 13px; margin-bottom: 10px;">' + shortDesc + '</div>';
        }
        
        if (topic.keywords && topic.keywords.length > 0) {
            content += '<div style="margin-bottom: 8px;">';
            content += '<span style="color: #fbbf24; font-size: 11px; font-weight: 500;">Keywords: </span>';
            content += '<span style="color: #d1d5db; font-size: 11px;">' + topic.keywords.slice(0, 4).join(', ') + '</span>';
            content += '</div>';
        }
        
        if (topic.quotes && topic.quotes.length > 0) {
            content += '<div style="color: #9ca3af; font-size: 11px; font-style: italic; margin-bottom: 8px;">';
            content += '"' + (topic.quotes[0].length > 80 ? topic.quotes[0].substring(0, 80) + '...' : topic.quotes[0]) + '"';
            content += '</div>';
        }
        
        if (topic.subtopics && topic.subtopics.length > 0) {
            content += '<div style="color: #34d399; font-size: 11px; font-weight: 500;">';
            content += '📊 ' + topic.subtopics.length + ' subtopic' + (topic.subtopics.length > 1 ? 's' : '') + ' available';
            content += '</div>';
        }
        
        content += '<div style="color: #6b7280; font-size: 10px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">';
        content += '💡 Click to explore in depth';
        content += '</div>';
        
        preview.innerHTML = content;
        
        // Position tooltip
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const previewWidth = 320;
        const previewHeight = 200;
        
        let left = mouseX + 15;
        let top = mouseY - 10;
        
        if (left + previewWidth > window.innerWidth) {
            left = mouseX - previewWidth - 15;
        }
        if (top + previewHeight > window.innerHeight) {
            top = mouseY - previewHeight + 10;
        }
        if (top < 0) {
            top = 10;
        }
        
        preview.style.left = left + 'px';
        preview.style.top = top + 'px';
        preview.style.display = 'block';
        preview.style.opacity = '0';
        preview.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            preview.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            preview.style.opacity = '1';
            preview.style.transform = 'translateY(0)';
        }, 10);
    }
    
    hideTopicPreview() {
        const preview = document.getElementById('topicPreview');
        if (preview) {
            preview.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
            preview.style.opacity = '0';
            preview.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                preview.style.display = 'none';
            }, 150);
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
        
        // Set title and description
        title.textContent = topic.title || 'Topic';
        description.textContent = topic.description || 'No description available';
        
        // Clear and populate content
        quotes.innerHTML = '';
        
        // Add detailed overview section
        const overviewSection = document.createElement('div');
        overviewSection.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
        overviewSection.style.padding = '16px';
        overviewSection.style.borderRadius = '8px';
        overviewSection.style.marginBottom = '16px';
        overviewSection.style.border = '1px solid #cbd5e1';
        
        const overviewTitle = document.createElement('h4');
        overviewTitle.textContent = '📋 Overview';
        overviewTitle.style.color = '#1e3c72';
        overviewTitle.style.marginBottom = '8px';
        overviewTitle.style.fontSize = '14px';
        overviewTitle.style.fontWeight = '600';
        overviewSection.appendChild(overviewTitle);
        
        const overviewText = document.createElement('p');
        overviewText.textContent = this.generateTopicOverview(topic);
        overviewText.style.fontSize = '13px';
        overviewText.style.lineHeight = '1.5';
        overviewText.style.color = '#475569';
        overviewSection.appendChild(overviewText);
        
        quotes.appendChild(overviewSection);
        
        // Add key insights section
        if (topic.quotes && topic.quotes.length > 0) {
            const insightsHeader = document.createElement('h4');
            insightsHeader.textContent = '💡 Key Insights & Quotes';
            insightsHeader.style.color = '#1e3c72';
            insightsHeader.style.marginBottom = '12px';
            insightsHeader.style.fontSize = '14px';
            insightsHeader.style.fontWeight = '600';
            quotes.appendChild(insightsHeader);
            
            topic.quotes.forEach(function(quote, index) {
                const quoteContainer = document.createElement('div');
                quoteContainer.className = 'quote';
                quoteContainer.style.position = 'relative';
                quoteContainer.style.paddingLeft = '20px';
                
                const quoteIcon = document.createElement('span');
                quoteIcon.textContent = '🗨️';
                quoteIcon.style.position = 'absolute';
                quoteIcon.style.left = '4px';
                quoteIcon.style.top = '12px';
                quoteContainer.appendChild(quoteIcon);
                
                const quoteText = document.createElement('div');
                quoteText.textContent = '"' + quote + '"';
                quoteText.style.fontStyle = 'italic';
                quoteText.style.marginBottom = '6px';
                quoteContainer.appendChild(quoteText);
                
                const quoteContext = document.createElement('div');
                quoteContext.textContent = '— ' + this.generateQuoteContext(topic, index);
                quoteContext.style.fontSize = '11px';
                quoteContext.style.color = '#64748b';
                quoteContext.style.fontWeight = '500';
                quoteContainer.appendChild(quoteContext);
                
                quotes.appendChild(quoteContainer);
            }, this);
        }
        
        // Add keywords section
        if (topic.keywords && topic.keywords.length > 0) {
            const keywordsHeader = document.createElement('h4');
            keywordsHeader.textContent = '🏷️ Related Keywords & Concepts';
            keywordsHeader.style.marginTop = '20px';
            keywordsHeader.style.marginBottom = '10px';
            keywordsHeader.style.color = '#1e3c72';
            keywordsHeader.style.fontSize = '14px';
            keywordsHeader.style.fontWeight = '600';
            quotes.appendChild(keywordsHeader);
            
            const keywordsContainer = document.createElement('div');
            keywordsContainer.style.display = 'flex';
            keywordsContainer.style.flexWrap = 'wrap';
            keywordsContainer.style.gap = '8px';
            keywordsContainer.style.marginBottom = '16px';
            
            topic.keywords.forEach(function(keyword) {
                const keywordBadge = document.createElement('span');
                keywordBadge.textContent = keyword;
                keywordBadge.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                keywordBadge.style.color = 'white';
                keywordBadge.style.padding = '6px 12px';
                keywordBadge.style.borderRadius = '16px';
                keywordBadge.style.fontSize = '11px';
                keywordBadge.style.fontWeight = '500';
                keywordBadge.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                keywordsContainer.appendChild(keywordBadge);
            });
            
            quotes.appendChild(keywordsContainer);
        }
        
        // Add subtopics section with enhanced content
        if (topic.subtopics && topic.subtopics.length > 0) {
            const subtopicsHeader = document.createElement('h4');
            subtopicsHeader.textContent = '🌐 Detailed Subtopics (' + topic.subtopics.length + ')';
            subtopicsHeader.style.marginTop = '20px';
            subtopicsHeader.style.marginBottom = '12px';
            subtopicsHeader.style.color = '#1e3c72';
            subtopicsHeader.style.fontSize = '14px';
            subtopicsHeader.style.fontWeight = '600';
            quotes.appendChild(subtopicsHeader);
            
            topic.subtopics.forEach(function(subtopic, index) {
                const subtopicCard = document.createElement('div');
                subtopicCard.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
                subtopicCard.style.padding = '16px';
                subtopicCard.style.margin = '12px 0';
                subtopicCard.style.borderRadius = '12px';
                subtopicCard.style.borderLeft = '4px solid #0ea5e9';
                subtopicCard.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.1)';
                subtopicCard.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
                subtopicCard.style.cursor = 'pointer';
                
                // Add hover effect
                subtopicCard.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 16px rgba(14, 165, 233, 0.2)';
                });
                subtopicCard.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.1)';
                });
                
                const subtopicHeader = document.createElement('div');
                subtopicHeader.style.display = 'flex';
                subtopicHeader.style.alignItems = 'center';
                subtopicHeader.style.marginBottom = '8px';
                
                const subtopicIcon = document.createElement('span');
                subtopicIcon.textContent = '🔹';
                subtopicIcon.style.marginRight = '8px';
                subtopicHeader.appendChild(subtopicIcon);
                
                const subtopicTitle = document.createElement('strong');
                subtopicTitle.textContent = subtopic.title;
                subtopicTitle.style.color = '#0c4a6e';
                subtopicTitle.style.fontSize = '13px';
                subtopicTitle.style.fontWeight = '600';
                subtopicHeader.appendChild(subtopicTitle);
                
                subtopicCard.appendChild(subtopicHeader);
                
                if (subtopic.description) {
                    const subtopicDesc = document.createElement('div');
                    subtopicDesc.textContent = subtopic.description;
                    subtopicDesc.style.fontSize = '12px';
                    subtopicDesc.style.color = '#475569';
                    subtopicDesc.style.lineHeight = '1.4';
                    subtopicDesc.style.marginBottom = '10px';
                    subtopicCard.appendChild(subtopicDesc);
                }
                
                if (subtopic.quotes && subtopic.quotes.length > 0) {
                    const subtopicQuote = document.createElement('div');
                    subtopicQuote.style.background = 'rgba(255, 255, 255, 0.7)';
                    subtopicQuote.style.padding = '8px 12px';
                    subtopicQuote.style.borderRadius = '6px';
                    subtopicQuote.style.fontSize = '11px';
                    subtopicQuote.style.fontStyle = 'italic';
                    subtopicQuote.style.color = '#64748b';
                    subtopicQuote.style.borderLeft = '2px solid #0ea5e9';
                    subtopicQuote.innerHTML = '<span style="color: #0ea5e9;">💬</span> "' + subtopic.quotes[0] + '"';
                    subtopicCard.appendChild(subtopicQuote);
                }
                
                // Add engagement metrics
                const engagementDiv = document.createElement('div');
                engagementDiv.style.marginTop = '10px';
                engagementDiv.style.padding = '6px 0';
                engagementDiv.style.borderTop = '1px solid rgba(14, 165, 233, 0.2)';
                engagementDiv.style.fontSize = '10px';
                engagementDiv.style.color = '#64748b';
                engagementDiv.innerHTML = '📊 Relevance: ' + this.calculateRelevanceScore(subtopic) + '% • 🎯 Focus: ' + this.getTopicFocus(subtopic);
                subtopicCard.appendChild(engagementDiv);
                
                quotes.appendChild(subtopicCard);
            }, this);
        }
        
        // Add discussion impact section
        const impactSection = document.createElement('div');
        impactSection.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)';
        impactSection.style.padding = '14px';
        impactSection.style.borderRadius = '8px';
        impactSection.style.marginTop = '16px';
        impactSection.style.border = '1px solid #f59e0b';
        
        const impactHeader = document.createElement('h4');
        impactHeader.textContent = '🎯 Discussion Impact';
        impactHeader.style.color = '#92400e';
        impactHeader.style.marginBottom = '6px';
        impactHeader.style.fontSize = '13px';
        impactHeader.style.fontWeight = '600';
        impactSection.appendChild(impactHeader);
        
        const impactText = document.createElement('p');
        impactText.textContent = this.generateImpactAnalysis(topic);
        impactText.style.fontSize = '12px';
        impactText.style.color = '#78350f';
        impactText.style.lineHeight = '1.4';
        impactSection.appendChild(impactText);
        
        quotes.appendChild(impactSection);
        
        // Show the panel
        topicInfo.style.display = 'block';
        console.log('Enhanced topic info displayed for:', topic.title);
    }
    
    generateTopicOverview(topic) {
        const keywordCount = topic.keywords ? topic.keywords.length : 0;
        const subtopicCount = topic.subtopics ? topic.subtopics.length : 0;
        const quoteCount = topic.quotes ? topic.quotes.length : 0;
        
        let overview = 'This topic explores ';
        
        if (topic.keywords && topic.keywords.length > 0) {
            overview += 'key concepts including ' + topic.keywords.slice(0, 3).join(', ');
            if (topic.keywords.length > 3) {
                overview += ' and ' + (topic.keywords.length - 3) + ' other related areas';
            }
            overview += '. ';
        }
        
        if (subtopicCount > 0) {
            overview += 'The discussion branches into ' + subtopicCount + ' specialized subtopic' + (subtopicCount > 1 ? 's' : '') + ', ';
            overview += 'providing comprehensive coverage of the subject matter. ';
        }
        
        if (quoteCount > 0) {
            overview += 'Contains ' + quoteCount + ' key insight' + (quoteCount > 1 ? 's' : '') + ' and memorable quotes that highlight the main points discussed.';
        }
        
        return overview || 'This topic contains valuable insights and information worth exploring.';
    }
    
    generateQuoteContext(topic, quoteIndex) {
        const contexts = [
            'Key insight from the discussion',
            'Important perspective shared',
            'Notable observation made',
            'Significant point emphasized',
            'Valuable takeaway highlighted',
            'Expert opinion expressed',
            'Critical insight revealed'
        ];
        
        return contexts[quoteIndex % contexts.length];
    }
    
    calculateRelevanceScore(subtopic) {
        // Simple relevance calculation based on content richness
        let score = 60; // Base score
        
        if (subtopic.description && subtopic.description.length > 50) score += 15;
        if (subtopic.quotes && subtopic.quotes.length > 0) score += 20;
        if (subtopic.keywords && subtopic.keywords.length > 2) score += 5;
        
        return Math.min(score, 95); // Cap at 95%
    }
    
    getTopicFocus(subtopic) {
        const focuses = ['High', 'Moderate', 'Detailed', 'Comprehensive', 'Specific'];
        return focuses[Math.floor(Math.random() * focuses.length)];
    }
    
    generateImpactAnalysis(topic) {
        const subtopicCount = topic.subtopics ? topic.subtopics.length : 0;
        const keywordCount = topic.keywords ? topic.keywords.length : 0;
        
        let impact = 'This topic ';
        
        if (subtopicCount > 2) {
            impact += 'demonstrates comprehensive coverage with multiple interconnected aspects, ';
        } else if (subtopicCount > 0) {
            impact += 'provides focused exploration with specific sub-areas, ';
        }
        
        if (keywordCount > 4) {
            impact += 'spanning a broad conceptual landscape. ';
        } else if (keywordCount > 2) {
            impact += 'covering essential related concepts. ';
        }
        
        impact += 'The depth of discussion suggests this is a significant theme in the overall conversation, ';
        impact += 'likely influencing other topics and providing valuable insights for listeners.';
        
        return impact;
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
        
        // Hide topics panel
        const topicsPanel = document.getElementById('topicsPanel');
        if (topicsPanel) {
            topicsPanel.style.display = 'none';
        }
        
        console.log('Visualization cleared');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Add gentle floating animation
        const time = Date.now() * 0.001;
        
        this.topicMeshes.forEach(mesh => {
            if (mesh.userData && mesh.userData.topic && mesh.userData.type) {
                // Gentle floating motion
                const floatSpeed = mesh.userData.type === 'main' ? 0.5 : 0.3;
                const floatAmount = mesh.userData.type === 'main' ? 2 : 1;
                const offset = mesh.userData.index || 0;
                
                if (mesh.userData.originalPosition) {
                    mesh.position.y = mesh.userData.originalPosition.y + 
                        Math.sin(time * floatSpeed + offset) * floatAmount;
                    
                    // Update glow position
                    if (mesh.userData.glow) {
                        mesh.userData.glow.position.copy(mesh.position);
                    }
                }
                
                // Gentle rotation for main topics
                if (mesh.userData.type === 'main') {
                    mesh.rotation.y += 0.003;
                }
                
                // Pulse glow effect when hovered
                if (mesh.userData.isHovered && mesh.userData.glow) {
                    mesh.userData.glow.material.opacity = 0.3 + Math.sin(time * 4) * 0.15;
                }
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        const width = window.innerWidth - 400;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Remove the duplicate placeholder methods at the bottom of the file
}

// Initialize the visualizer and make it globally accessible
console.log('Initializing podcast visualizer...');
const visualizer = new PodcastVisualizer();
window.visualizer = visualizer;

// Handle window resize
window.addEventListener('resize', () => visualizer.handleResize());
