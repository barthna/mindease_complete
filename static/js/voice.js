// Enhanced Voice Management for MindEase
class VoiceManager {
    constructor() {
        this.isListening = false;
        this.isSpeaking = false;
        this.isVoiceEnabled = false;
        this.recognition = null;
        this.synthesis = null;
        this.voiceToggle = document.getElementById('voiceToggle');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.currentLanguage = 'auto';
        this.voices = [];
        this.selectedVoice = null;
        this.lastTranscript = '';
        this.interimTranscript = '';
        
        this.initializeVoice();
        this.setupEventListeners();
        this.loadVoicePreferences();
    }

    initializeVoice() {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Enhanced recognition settings
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 3;
            this.recognition.lang = 'en-US';
            
            this.setupRecognitionEvents();
        } else {
            console.warn('Speech Recognition not supported in this browser');
            this.showVoiceError('Speech recognition not supported in this browser');
            this.disableVoiceFeatures();
        }
        
        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.loadVoices();
            
            // Load voices when they become available
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        } else {
            console.warn('Speech Synthesis not supported in this browser');
            this.showVoiceError('Text-to-speech not supported in this browser');
        }
    }

    setupRecognitionEvents() {
        if (!this.recognition) return;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.showVoiceStatus('Listening...', 'listening');
            this.updateVoiceButton(true);
            this.addVoiceVisualFeedback();
        };
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    this.lastTranscript = transcript;
                } else {
                    interimTranscript += transcript;
                    this.interimTranscript = transcript;
                }
            }
            
            // Update input with real-time transcription
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                if (finalTranscript) {
                    messageInput.value = finalTranscript;
                    this.triggerInputEvent(messageInput);
                } else if (interimTranscript) {
                    // Show interim results with visual indication
                    messageInput.value = interimTranscript;
                    messageInput.style.fontStyle = 'italic';
                    messageInput.style.opacity = '0.8';
                }
            }
            
            // Auto-send when final result is received and meets criteria
            if (finalTranscript.trim() && event.results[event.results.length - 1].isFinal) {
                this.processFinalTranscript(finalTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
            
            const errorMessages = {
                'no-speech': 'No speech detected. Please try again.',
                'audio-capture': 'Microphone access denied. Please allow microphone access.',
                'not-allowed': 'Microphone access not allowed. Please check permissions.',
                'network': 'Network error. Please check your connection.',
                'service-not-allowed': 'Speech service not allowed. Please try again.',
                'bad-grammar': 'Speech not recognized. Please speak clearly.',
                'language-not-supported': 'Language not supported. Switching to English.'
            };
            
            const errorMessage = errorMessages[event.error] || `Voice recognition error: ${event.error}`;
            this.showVoiceError(errorMessage);
            
            // Auto-retry for certain errors
            if (['no-speech', 'bad-grammar'].includes(event.error) && this.isVoiceEnabled) {
                setTimeout(() => {
                    if (this.isVoiceEnabled) {
                        this.startListening();
                    }
                }, 2000);
            }
        };
        
        this.recognition.onend = () => {
            this.stopListening();
            
            // Auto-restart if voice mode is enabled and not manually stopped
            if (this.isVoiceEnabled && !this.isSpeaking) {
                setTimeout(() => {
                    if (this.isVoiceEnabled) {
                        this.startListening();
                    }
                }, 1000);
            }
        };
    }

    setupEventListeners() {
        if (this.voiceToggle) {
            this.voiceToggle.addEventListener('click', () => {
                this.toggleVoiceMode();
            });
        }
        
        // Stop speaking when new message is being typed
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                if (this.isSpeaking) {
                    this.stopSpeaking();
                }
                
                // Reset font style if it was italic from interim results
                messageInput.style.fontStyle = 'normal';
                messageInput.style.opacity = '1';
            });
            
            // Handle manual typing during voice mode
            messageInput.addEventListener('keydown', () => {
                if (this.isListening) {
                    this.stopListening();
                }
            });
        }
        
        // Language change handler
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
        
        // Visibility change handler to pause voice in background
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isListening) {
                this.stopListening();
            }
        });
    }

    loadVoices() {
        this.voices = speechSynthesis.getVoices();
        this.selectOptimalVoice();
    }

    selectOptimalVoice() {
        if (this.voices.length === 0) return;
        
        // Enhanced voice preferences with better selection logic
        const voicePreferences = [
            // Premium voices first
            { pattern: /premium|neural|enhanced/i, priority: 1 },
            
            // English voices by quality
            { lang: 'en-US', names: ['Samantha', 'Alex', 'Victoria', 'Ava', 'Google US English'], priority: 2 },
            { lang: 'en-GB', names: ['Daniel', 'Kate', 'Serena', 'Google UK English'], priority: 2 },
            { lang: 'en-AU', names: ['Karen', 'Google Australian English'], priority: 2 },
            
            // Hindi voices
            { lang: 'hi-IN', names: ['Google हिन्दी', 'Microsoft Hemant', 'Lekha'], priority: 3 },
            
            // Gujarati voices
            { lang: 'gu-IN', names: ['Google ગુજરાતી'], priority: 3 },
            
            // Fallback to any English
            { lang: 'en', names: [], priority: 4 }
        ];
        
        let bestVoice = null;
        let bestPriority = 999;
        
        this.voices.forEach(voice => {
            for (const pref of voicePreferences) {
                let matches = false;
                let priority = pref.priority;
                
                // Check for premium indicators
                if (pref.pattern && pref.pattern.test(voice.name)) {
                    matches = true;
                    priority = pref.priority;
                }
                // Check language and name matching
                else if (pref.lang && voice.lang.startsWith(pref.lang)) {
                    if (pref.names.length === 0) {
                        matches = true;
                    } else {
                        matches = pref.names.some(name => 
                            voice.name.toLowerCase().includes(name.toLowerCase())
                        );
                    }
                }
                
                if (matches && priority < bestPriority) {
                    bestVoice = voice;
                    bestPriority = priority;
                }
            }
        });
        
        this.selectedVoice = bestVoice || this.voices[0];
        
        if (this.selectedVoice) {
            console.log('Selected voice:', this.selectedVoice.name, this.selectedVoice.lang);
        }
    }

    setLanguage(language) {
        this.currentLanguage = language;
        
        // Update recognition language
        if (this.recognition) {
            const langCodes = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'gu': 'gu-IN',
                'auto': 'en-US'
            };
            
            this.recognition.lang = langCodes[language] || 'en-US';
        }
        
        // Update selected voice for synthesis
        this.selectOptimalVoice();
        
        // Save preference
        localStorage.setItem('mindease_voice_language', language);
    }

    toggleVoiceMode() {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        
        if (this.isVoiceEnabled) {
            this.startVoiceMode();
        } else {
            this.stopVoiceMode();
        }
        
        // Save preference
        localStorage.setItem('mindease_voice_enabled', this.isVoiceEnabled.toString());
    }

    startVoiceMode() {
        if (!this.recognition) {
            this.showVoiceError('Voice recognition not available');
            this.isVoiceEnabled = false;
            return;
        }
        
        this.isVoiceEnabled = true;
        this.updateVoiceButton(false, true);
        this.showNotification('Voice mode enabled. Speak your message!', 'success');
        
        // Start listening
        setTimeout(() => {
            if (this.isVoiceEnabled) {
                this.startListening();
            }
        }, 500);
    }

    stopVoiceMode() {
        this.isVoiceEnabled = false;
        this.stopListening();
        this.stopSpeaking();
        this.updateVoiceButton(false, false);
        this.hideVoiceStatus();
        this.showNotification('Voice mode disabled', 'info');
    }

    startListening() {
        if (!this.recognition || this.isListening || !this.isVoiceEnabled) return;
        
        try {
            // Stop any ongoing speech
            this.stopSpeaking();
            
            // Set language for recognition
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                this.setLanguage(languageSelect.value);
            }
            
            // Clear previous transcripts
            this.lastTranscript = '';
            this.interimTranscript = '';
            
            this.recognition.start();
            
            // Auto-stop after 15 seconds for better UX
            this.listenTimeout = setTimeout(() => {
                if (this.isListening) {
                    this.stopListening();
                }
            }, 15000);
            
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showVoiceError('Failed to start voice recognition');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        this.hideVoiceStatus();
        this.updateVoiceButton(false, this.isVoiceEnabled);
        this.removeVoiceVisualFeedback();
        
        // Clear timeout
        if (this.listenTimeout) {
            clearTimeout(this.listenTimeout);
            this.listenTimeout = null;
        }
        
        // Reset input styling
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.style.fontStyle = 'normal';
            messageInput.style.opacity = '1';
        }
    }

    speak(text) {
        if (!this.synthesis || !text) return;
        
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Clean text for better speech
        const cleanText = this.cleanTextForSpeech(text);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Configure utterance with enhanced settings
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        // Adjust speech parameters for mental health context
        utterance.rate = 0.85;  // Slightly slower for calming effect
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        
        // Set language based on current selection
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            const langCodes = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'gu': 'gu-IN',
                'auto': 'en-US'
            };
            utterance.lang = langCodes[languageSelect.value] || 'en-US';
        }
        
        // Event handlers with enhanced feedback
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.showSpeakingIndicator();
            this.showVoiceStatus('Speaking...', 'speaking');
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
            this.hideVoiceStatus();
            
            // Resume listening if voice mode is enabled
            if (this.isVoiceEnabled && !this.isListening) {
                setTimeout(() => {
                    if (this.isVoiceEnabled && !this.isListening) {
                        this.startListening();
                    }
                }, 500);
            }
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
            this.hideVoiceStatus();
            this.showVoiceError('Speech playback error');
        };
        
        utterance.onpause = () => {
            this.showVoiceStatus('Speech paused', 'paused');
        };
        
        utterance.onresume = () => {
            this.showVoiceStatus('Speaking...', 'speaking');
        };
        
        // Speak the text
        this.synthesis.speak(utterance);
        
        return utterance;
    }

    stopSpeaking() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
            this.hideVoiceStatus();
        }
    }

    cleanTextForSpeech(text) {
        return text
            // Remove markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
            .replace(/\*(.*?)\*/g, '$1')      // Italic
            .replace(/[#*_`]/g, '')           // Other markdown
            
            // Handle URLs and special content
            .replace(/https?:\/\/[^\s]+/g, 'link')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Markdown links
            
            // Improve speech flow
            .replace(/\n+/g, '. ')            // Newlines to pauses
            .replace(/•/g, '')                // Remove bullets
            .replace(/\s+/g, ' ')             // Multiple spaces
            
            // Remove or replace emojis with words
            .replace(/💙|❤️|💚|💛|💜|🧡/g, 'heart')
            .replace(/😊|😀|😃|😄|😁|🙂/g, '')
            .replace(/😢|😭|😔|☹️|🙁/g, '')
            .replace(/😰|😨|😱|😟|😕/g, '')
            .replace(/😡|😠|🤬|😤/g, '')
            .replace(/🌟|⭐|✨/g, '')
            .replace(/🤗|🫂/g, '')
            
            // Clean up remaining special characters
            .replace(/[^\w\s.,!?;:()-]/g, '')
            .trim();
    }

    processFinalTranscript(transcript) {
        this.stopListening();
        
        // Process transcript for better UX
        const cleanTranscript = transcript.trim();
        
        if (cleanTranscript.length < 3) {
            this.showVoiceError('Message too short. Please try again.');
            return;
        }
        
        // Auto-send with slight delay for user confirmation
        setTimeout(() => {
            if (window.mindEaseChat) {
                window.mindEaseChat.sendMessage();
            }
        }, 800);
    }

    triggerInputEvent(input) {
        // Trigger input events for real-time features
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Update related UI elements
        if (window.mindEaseChat) {
            window.mindEaseChat.updateSendButton();
            window.mindEaseChat.updateCharCount();
        }
    }

    updateVoiceButton(isListening = false, isEnabled = false) {
        if (!this.voiceToggle) return;
        
        const icon = this.voiceToggle.querySelector('i');
        
        if (isListening) {
            this.voiceToggle.classList.add('active');
            icon.className = 'fas fa-microphone-slash';
            this.voiceToggle.style.background = 'var(--accent-gradient)';
            this.voiceToggle.style.animation = 'voicePulse 1s ease-in-out infinite';
        } else if (isEnabled) {
            this.voiceToggle.classList.add('active');
            icon.className = 'fas fa-microphone';
            this.voiceToggle.style.background = 'var(--primary-gradient)';
            this.voiceToggle.style.animation = 'none';
        } else {
            this.voiceToggle.classList.remove('active');
            icon.className = 'fas fa-microphone';
            this.voiceToggle.style.background = 'var(--card-bg)';
            this.voiceToggle.style.animation = 'none';
        }
    }

    showVoiceStatus(message, type = 'default') {
        if (this.voiceStatus) {
            const span = this.voiceStatus.querySelector('span');
            if (span) {
                span.textContent = message;
            }
            
            // Update animation based on type
            const waves = this.voiceStatus.querySelectorAll('.voice-wave');
            waves.forEach((wave, index) => {
                if (type === 'listening') {
                    wave.style.animation = `voiceWave 1s ease-in-out infinite`;
                    wave.style.animationDelay = `${index * 0.1}s`;
                } else if (type === 'speaking') {
                    wave.style.animation = `voiceWave 0.5s ease-in-out infinite`;
                    wave.style.animationDelay = `${index * 0.05}s`;
                } else {
                    wave.style.animation = 'none';
                }
            });
            
            this.voiceStatus.classList.add('show');
        }
    }

    hideVoiceStatus() {
        if (this.voiceStatus) {
            this.voiceStatus.classList.remove('show');
        }
    }

    addVoiceVisualFeedback() {
        // Add visual feedback during listening
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.parentElement.style.borderColor = 'var(--accent-gradient)';
            messageInput.parentElement.style.boxShadow = '0 0 20px rgba(79, 172, 254, 0.4)';
            messageInput.placeholder = 'Listening... Speak now';
        }
    }

    removeVoiceVisualFeedback() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.parentElement.style.borderColor = 'var(--border-color)';
            messageInput.parentElement.style.boxShadow = 'none';
            messageInput.placeholder = 'Share what\'s on your mind...';
        }
    }

    showSpeakingIndicator() {
        // Add speaking animation to bot avatar
        const botAvatar = document.querySelector('.bot-avatar');
        if (botAvatar) {
            botAvatar.style.animation = 'speakingPulse 0.5s ease-in-out infinite';
            botAvatar.style.boxShadow = '0 0 40px rgba(102, 126, 234, 0.8)';
        }
        
        // Update all bot avatars
        const botAvatars = document.querySelectorAll('.bot-avatar-small');
        botAvatars.forEach(avatar => {
            avatar.style.animation = 'speakingPulse 0.5s ease-in-out infinite';
        });
    }

    hideSpeakingIndicator() {
        // Remove speaking animation
        const botAvatar = document.querySelector('.bot-avatar');
        if (botAvatar) {
            botAvatar.style.animation = 'avatarPulse 2s ease-in-out infinite';
            botAvatar.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.5)';
        }
        
        const botAvatars = document.querySelectorAll('.bot-avatar-small');
        botAvatars.forEach(avatar => {
            avatar.style.animation = 'none';
        });
    }

    showVoiceError(message) {
        // Show error notification
        if (window.mindEaseChat) {
            window.mindEaseChat.showNotification(message, 'error');
        }
        
        // Reset voice button state
        this.updateVoiceButton(false, this.isVoiceEnabled);
        this.hideVoiceStatus();
        
        console.error('Voice error:', message);
    }

    showNotification(message, type) {
        if (window.mindEaseChat) {
            window.mindEaseChat.showNotification(message, type);
        }
    }

    disableVoiceFeatures() {
        if (this.voiceToggle) {
            this.voiceToggle.style.display = 'none';
        }
    }

    loadVoicePreferences() {
        // Load saved preferences
        const savedLanguage = localStorage.getItem('mindease_voice_language');
        if (savedLanguage) {
            this.setLanguage(savedLanguage);
        }
        
        const savedEnabled = localStorage.getItem('mindease_voice_enabled');
        if (savedEnabled === 'true') {
            setTimeout(() => {
                this.startVoiceMode();
            }, 1000);
        }
    }

    // Public methods for external use
    isVoiceEnabled() {
        return this.isVoiceEnabled;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getVoiceCapabilities() {
        return {
            recognition: !!this.recognition,
            synthesis: !!this.synthesis,
            voicesAvailable: this.voices.length,
            selectedVoice: this.selectedVoice?.name || 'None'
        };
    }
}

// Export for global use
window.VoiceManager = VoiceManager;
