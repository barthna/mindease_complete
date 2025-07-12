// Enhanced MindEase Chatbot JavaScript with Premium Features
class MindEaseChat {
    constructor() {
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.leftSidebar = document.getElementById('leftSidebar');
        this.rightSidebar = document.getElementById('rightSidebar');
        this.analysisToggle = document.getElementById('analysisToggle');
        this.thoughtsBtn = document.getElementById('thoughtsBtn');
        this.thoughtsModal = document.getElementById('thoughtsModal');
        
        this.isTyping = false;
        this.messageHistory = [];
        this.conversationContext = [];
        this.userLanguage = 'auto';
        this.messageCount = 0;
        this.sessionStartTime = new Date();
        
        this.initializeEventListeners();
        this.initializeWelcomeMessage();
        this.initializeBackgroundEffects();
        this.setupEmojiPicker();
        this.setupQuickStarters();
    }

    initializeEventListeners() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Real-time input feedback
        this.messageInput.addEventListener('input', (e) => {
            this.updateSendButton();
            this.updateCharCount();
            this.handleTypingFeedback(e.target.value);
            this.autoResizeInput();
        });
        
        // Enhanced focus effects
        this.messageInput.addEventListener('focus', () => {
            this.messageInput.parentElement.style.borderColor = 'rgba(102, 126, 234, 0.6)';
            this.messageInput.parentElement.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.3)';
        });
        
        this.messageInput.addEventListener('blur', () => {
            this.messageInput.parentElement.style.borderColor = 'var(--border-color)';
            this.messageInput.parentElement.style.boxShadow = 'none';
        });
        
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.userLanguage = e.target.value;
                this.showNotification(`Language changed to ${this.getLanguageName(e.target.value)}`, 'success');
            });
        }
        
        // Analysis toggle
        if (this.analysisToggle) {
            this.analysisToggle.addEventListener('click', () => {
                this.toggleRightSidebar();
            });
        }
        
        // Thoughts button
        if (this.thoughtsBtn) {
            this.thoughtsBtn.addEventListener('click', () => {
                this.openThoughtsModal();
            });
        }
        
        // Modal close events
        const closeThoughts = document.getElementById('closeThoughts');
        if (closeThoughts) {
            closeThoughts.addEventListener('click', () => {
                this.closeThoughtsModal();
            });
        }
        
        if (this.thoughtsModal) {
            this.thoughtsModal.addEventListener('click', (e) => {
                if (e.target === this.thoughtsModal) {
                    this.closeThoughtsModal();
                }
            });
        }
        
        // Collapse sidebar
        const collapseSidebar = document.getElementById('collapseSidebar');
        if (collapseSidebar) {
            collapseSidebar.addEventListener('click', () => {
                this.toggleRightSidebar();
            });
        }
        
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        this.updateSendButton();
    }

    initializeWelcomeMessage() {
        const welcomeTime = document.getElementById('welcomeTime');
        if (welcomeTime) {
            welcomeTime.textContent = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Hide any troubleshooting messages
        const troubleshootingMessages = document.querySelectorAll('.troubleshooting-message');
        troubleshootingMessages.forEach(msg => {
            msg.style.display = 'none';
        });
    }

    initializeBackgroundEffects() {
        // Create dynamic background particles
        this.createBackgroundParticles();
        
        // Create floating orbs
        this.createFloatingOrbs();
        
        // Start ambient animations
        this.startAmbientAnimations();
    }

    createBackgroundParticles() {
        const particlesContainer = document.querySelector('.bg-particles');
        if (!particlesContainer) return;
        
        // Create animated particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    createFloatingOrbs() {
        const orbsContainer = document.querySelector('.bg-floating-orbs');
        if (!orbsContainer) return;
        
        for (let i = 0; i < 4; i++) {
            const orb = document.createElement('div');
            orb.className = 'floating-orb';
            orb.style.left = Math.random() * 100 + '%';
            orb.style.top = Math.random() * 100 + '%';
            orb.style.animationDelay = Math.random() * 15 + 's';
            orb.style.animationDuration = (Math.random() * 10 + 15) + 's';
            orbsContainer.appendChild(orb);
        }
    }

    startAmbientAnimations() {
        // Pulse the bot avatar periodically
        setInterval(() => {
            const avatar = document.querySelector('.bot-avatar');
            if (avatar) {
                avatar.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    avatar.style.transform = 'scale(1)';
                }, 200);
            }
        }, 8000);
    }

    setupEmojiPicker() {
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiPicker = document.getElementById('emojiPicker');
        
        if (emojiBtn && emojiPicker) {
            emojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                emojiPicker.classList.toggle('show');
            });
            
            // Close emoji picker when clicking outside
            document.addEventListener('click', () => {
                emojiPicker.classList.remove('show');
            });
            
            // Handle emoji selection
            const emojis = emojiPicker.querySelectorAll('.emoji');
            emojis.forEach(emoji => {
                emoji.addEventListener('click', () => {
                    const emojiChar = emoji.dataset.emoji;
                    this.messageInput.value += emojiChar;
                    this.messageInput.focus();
                    emojiPicker.classList.remove('show');
                    this.updateSendButton();
                    this.updateCharCount();
                });
            });
        }
    }

    setupQuickStarters() {
        const quickStarters = document.querySelectorAll('.quick-starter');
        quickStarters.forEach(starter => {
            starter.addEventListener('click', () => {
                const message = starter.dataset.message;
                this.messageInput.value = message;
                this.updateSendButton();
                this.updateCharCount();
                this.sendMessage();
            });
        });
    }

    handleTypingFeedback(value) {
        // Real-time emotion detection as user types
        if (window.emotionSystem && value.length > 10) {
            const detectedEmotions = window.emotionSystem.detectEmotionsLocal(value);
            if (detectedEmotions.length > 0) {
                this.updateLiveEmotions(detectedEmotions);
            }
        }
    }

    updateLiveEmotions(emotions) {
        const liveEmotions = document.getElementById('liveEmotions');
        if (!liveEmotions) return;
        
        liveEmotions.innerHTML = '';
        
        emotions.slice(0, 3).forEach(emotion => {
            const tag = document.createElement('div');
            tag.className = 'live-emotion';
            tag.textContent = emotion;
            liveEmotions.appendChild(tag);
        });
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        const sendIcon = this.sendBtn.querySelector('i');
        
        if (hasText) {
            this.sendBtn.style.opacity = '1';
            this.sendBtn.style.transform = 'scale(1)';
            this.sendBtn.style.background = 'var(--primary-gradient)';
        } else {
            this.sendBtn.style.opacity = '0.7';
            this.sendBtn.style.transform = 'scale(0.95)';
        }
    }

    updateCharCount() {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            const currentLength = this.messageInput.value.length;
            charCount.textContent = `${currentLength}/1000`;
            
            if (currentLength > 900) {
                charCount.style.color = 'var(--warning-color)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        }
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    getLanguageName(code) {
        const langNames = {
            'auto': 'Auto-detect',
            'en': 'English',
            'hi': 'हिंदी',
            'hinglish': 'Hinglish',
            'gu': 'ગુજરાતી'
        };
        return langNames[code] || code;
    }

    toggleRightSidebar() {
        if (this.rightSidebar) {
            this.rightSidebar.classList.toggle('collapsed');
            
            // Update analysis toggle button
            if (this.analysisToggle) {
                const icon = this.analysisToggle.querySelector('i');
                if (this.rightSidebar.classList.contains('collapsed')) {
                    icon.className = 'fas fa-chart-line';
                } else {
                    icon.className = 'fas fa-times';
                }
            }
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Refresh charts if needed
        if (tabName === 'trends' && window.chartManager) {
            window.chartManager.updateTrendChart();
        } else if (tabName === 'patterns' && window.chartManager) {
            window.chartManager.updatePieChart();
        }
    }

    openThoughtsModal() {
        if (this.thoughtsModal) {
            this.thoughtsModal.classList.add('show');
            this.loadThoughts();
        }
    }

    closeThoughtsModal() {
        if (this.thoughtsModal) {
            this.thoughtsModal.classList.remove('show');
        }
    }

    async loadThoughts() {
        try {
            const response = await fetch('/api/thoughts');
            const data = await response.json();
            
            const thoughtsList = document.getElementById('thoughtsList');
            if (thoughtsList && data.thoughts) {
                thoughtsList.innerHTML = '';
                
                if (data.thoughts.length === 0) {
                    thoughtsList.innerHTML = `
                        <div class="empty-thoughts">
                            <i class="fas fa-journal-whills"></i>
                            <h3>No thoughts yet</h3>
                            <p>Start writing your thoughts and feelings to track your emotional journey.</p>
                        </div>
                    `;
                } else {
                    data.thoughts.forEach(thought => {
                        const thoughtDiv = document.createElement('div');
                        thoughtDiv.className = 'thought-item';
                        thoughtDiv.innerHTML = `
                            <div class="thought-content">
                                <p>${thought.content}</p>
                                <div class="thought-meta">
                                    <span class="thought-date">${thought.date}</span>
                                    ${thought.emotions && thought.emotions.length > 0 ? `
                                        <div class="thought-emotions">
                                            ${thought.emotions.map(emotion => `<span class="emotion-tag">${emotion}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                        thoughtsList.appendChild(thoughtDiv);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading thoughts:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // INSTANT user message display
        this.addUserMessage(message);
        this.conversationContext.push({role: 'user', content: message});
        
        // Clear input immediately
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.updateSendButton();
        this.updateCharCount();
        document.getElementById('liveEmotions').innerHTML = '';
        
        // Show enhanced typing indicator
       this.showTypingIndicator();
let responded = false;

try {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            language: this.userLanguage,
            context: this.conversationContext.slice(-6)
        })
    });

    const data = await response.json();
    responded = true;
    this.hideTypingIndicator();

    if (data.status === 'success') {
        this.addBotMessage(data.response);
        this.conversationContext.push({ role: 'bot', content: data.response });
                
                // Update emotion displays
                if (data.emotions && data.emotions.length > 0) {
                    if (window.emotionSystem) {
                        window.emotionSystem.updateCurrentEmotions(data.emotions, data.emotion_scores);
                        window.emotionSystem.addToHistory(data.emotions, data.emotion_scores);
                    }
                    
                    // Update charts
                    if (window.chartManager) {
                        window.chartManager.updateCharts();
                    }
                }
                
                // Handle voice response if enabled
                if (window.voiceManager && window.voiceManager.isVoiceEnabled()) {
                    window.voiceManager.speak(data.response);
                }
                
            } else {
        throw new Error(data.error || 'Failed to get response');
    }

} catch (error) {
    console.error('Error:', error);
    if (!responded) {
        this.hideTypingIndicator();
        this.addBotMessage("I'm having trouble connecting right now, but I want you to know that I'm here for you. Please try again in a moment. 💙");
    }
}
    }

    addUserMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">You</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <p>${this.escapeHtml(content)}</p>
                <div class="message-actions">
                    <button class="speak-btn" title="Listen to message" onclick="window.voiceManager && window.voiceManager.speak('${this.escapeHtml(content).replace(/'/g, "\\'")}')">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        this.messageCount++;
    }

    addBotMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="bot-avatar-small">
                <i class="fas fa-brain"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">MindEase</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <p>${this.escapeHtml(content)}</p>
                <div class="message-actions">
                    <button class="speak-btn" title="Listen to message" onclick="window.voiceManager && window.voiceManager.speak('${this.escapeHtml(content).replace(/'/g, "\\'")}')">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="like-btn" title="Save to journal" onclick="window.mindEaseChat.saveMessageToJournal('${this.escapeHtml(content).replace(/'/g, "\\'")}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        this.messageCount++;
    }

    showTypingIndicator() {
        this.isTyping = true;
        if (this.typingIndicator) {
            this.typingIndicator.classList.add('show');
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        if (this.typingIndicator) {
            this.typingIndicator.classList.remove('show');
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async saveMessageToJournal(content) {
        try {
            const response = await fetch('/api/save-thought', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: `AI Response: ${content}` })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                this.showNotification('Message saved to journal! ❤️', 'success');
            } else {
                throw new Error(data.error || 'Failed to save message');
            }
            
        } catch (error) {
            console.error('Error saving message:', error);
            this.showNotification('Failed to save message', 'error');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main chat interface
    window.mindEaseChat = new MindEaseChat();
    
    // Initialize emotion system
    if (typeof EmotionSystem !== 'undefined') {
        window.emotionSystem = new EmotionSystem();
    }
    
    // Initialize voice manager
    if (typeof VoiceManager !== 'undefined') {
        window.voiceManager = new VoiceManager();
    }
    
    // Initialize chart manager
    if (typeof ChartManager !== 'undefined') {
        window.chartManager = new ChartManager();
    }
    
    
    // Save thought functionality
    const saveThoughtBtn = document.getElementById('saveThought');
    const thoughtInput = document.getElementById('thoughtInput');
    
    if (saveThoughtBtn && thoughtInput) {
        saveThoughtBtn.addEventListener('click', async () => {
            const content = thoughtInput.value.trim();
            if (!content) {
                window.mindEaseChat.showNotification('Please write something before saving', 'warning');
                return;
            }
            
            try {
                const response = await fetch('/api/save-thought', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    thoughtInput.value = '';
                    window.mindEaseChat.showNotification('Thought saved successfully', 'success');
                    window.mindEaseChat.loadThoughts();
                } else {
                    throw new Error(data.error || 'Failed to save thought');
                }
                
            } catch (error) {
                console.error('Error saving thought:', error);
                window.mindEaseChat.showNotification('Failed to save thought', 'error');
            }
        });
        
        // Ctrl+Enter to save
        thoughtInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                saveThoughtBtn.click();
            }
        });
    }
    
    console.log('MindEase application initialized successfully');
});
