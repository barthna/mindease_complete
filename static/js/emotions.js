// Enhanced Real-time Emotion Detection System for MindEase
class EmotionSystem {
    constructor() {
        this.currentEmotions = [];
        this.emotionHistory = [];
        this.emotionScores = {};
        this.emotionTrends = {};
        this.lastUpdateTime = null;
        
        // Emotion configuration with enhanced mapping
        this.emotionConfig = {
            joy: { 
                emoji: '😊', 
                color: '#4ade80', 
                keywords: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'glad', 'cheerful', 'delighted'],
                intensity: 'positive'
            },
            sadness: { 
                emoji: '😢', 
                color: '#6b7280', 
                keywords: ['sad', 'depressed', 'down', 'upset', 'hurt', 'crying', 'disappointed', 'heartbroken', 'melancholy'],
                intensity: 'negative'
            },
            anger: { 
                emoji: '😠', 
                color: '#ef4444', 
                keywords: ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'rage', 'irritated', 'outraged', 'livid'],
                intensity: 'negative'
            },
            fear: { 
                emoji: '😨', 
                color: '#a855f7', 
                keywords: ['scared', 'afraid', 'terrified', 'frightened', 'worried', 'panic', 'anxious', 'nervous'],
                intensity: 'negative'
            },
            anxiety: { 
                emoji: '😰', 
                color: '#f59e0b', 
                keywords: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'restless', 'concerned'],
                intensity: 'negative'
            },
            love: { 
                emoji: '🥰', 
                color: '#ec4899', 
                keywords: ['love', 'care', 'affection', 'adore', 'cherish', 'treasure', 'appreciate', 'devoted'],
                intensity: 'positive'
            },
            calm: { 
                emoji: '😌', 
                color: '#06b6d4', 
                keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed', 'zen', 'balanced'],
                intensity: 'neutral'
            },
            excitement: { 
                emoji: '🤩', 
                color: '#f97316', 
                keywords: ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped', 'energetic', 'exhilarated'],
                intensity: 'positive'
            },
            hope: { 
                emoji: '🌟', 
                color: '#eab308', 
                keywords: ['hope', 'hopeful', 'optimistic', 'confident', 'positive', 'believe', 'faith', 'trust'],
                intensity: 'positive'
            },
            loneliness: { 
                emoji: '😔', 
                color: '#64748b', 
                keywords: ['lonely', 'alone', 'isolated', 'empty', 'disconnected', 'abandoned', 'solitary'],
                intensity: 'negative'
            },
            gratitude: { 
                emoji: '🙏', 
                color: '#10b981', 
                keywords: ['grateful', 'thankful', 'blessed', 'appreciate', 'thanks', 'indebted', 'obliged'],
                intensity: 'positive'
            },
            confusion: { 
                emoji: '😕', 
                color: '#8b5cf6', 
                keywords: ['confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'bewildered', 'perplexed'],
                intensity: 'neutral'
            }
        };
        
        this.initializeEmotionDisplay();
        this.startEmotionUpdateLoop();
    }

    initializeEmotionDisplay() {
        // Initialize emotion containers
        this.currentEmotionsContainer = document.getElementById('currentEmotions');
        this.emotionTimelineContainer = document.getElementById('emotionTimeline');
        this.emotionInsightsContainer = document.getElementById('emotionInsights');
        
        // Set initial state
        this.updateCurrentEmotions(['calm'], { calm: 0.6 });
        this.updateInsights();
    }

    // Real-time local emotion detection for typing feedback
    detectEmotionsLocal(text) {
        const detectedEmotions = [];
        const textLower = text.toLowerCase();
        const words = textLower.split(/\s+/);
        
        for (const [emotion, config] of Object.entries(this.emotionConfig)) {
            const matchCount = config.keywords.filter(keyword => 
                words.some(word => word.includes(keyword) || keyword.includes(word))
            ).length;
            
            if (matchCount > 0) {
                detectedEmotions.push({
                    emotion: emotion,
                    confidence: Math.min(matchCount * 0.3 + 0.4, 1.0),
                    matches: matchCount
                });
            }
        }
        
        // Sort by confidence and return top emotions
        return detectedEmotions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3)
            .map(e => e.emotion);
    }

    // Update current emotions display with enhanced animations
    updateCurrentEmotions(emotions, scores = {}) {
        if (!this.currentEmotionsContainer) return;
        
        this.currentEmotions = emotions;
        this.emotionScores = scores;
        this.lastUpdateTime = new Date();
        
        // Clear existing emotions with fade out
        const existingItems = this.currentEmotionsContainer.querySelectorAll('.emotion-item');
        existingItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                setTimeout(() => item.remove(), 300);
            }, index * 50);
        });
        
        // Add new emotions with staggered animation
        setTimeout(() => {
            emotions.forEach((emotion, index) => {
                setTimeout(() => {
                    this.addEmotionItem(emotion, scores[emotion] || 0.7);
                }, index * 100);
            });
        }, 200);
        
        // Update emotion status
        this.updateEmotionStatus();
    }

    addEmotionItem(emotion, score) {
        if (!this.currentEmotionsContainer) return;
        
        const config = this.emotionConfig[emotion];
        if (!config) return;
        
        const percentage = Math.round(score * 100);
        
        const emotionItem = document.createElement('div');
        emotionItem.className = 'emotion-item';
        emotionItem.style.opacity = '0';
        emotionItem.style.transform = 'translateX(-20px)';
        
        emotionItem.innerHTML = `
            <div class="emotion-icon">${config.emoji}</div>
            <div class="emotion-info">
                <span class="emotion-name">${emotion}</span>
                <div class="emotion-bar">
                    <div class="emotion-progress" style="width: 0%; background: ${config.color}"></div>
                </div>
                <span class="emotion-percentage">${percentage}%</span>
            </div>
        `;
        
        this.currentEmotionsContainer.appendChild(emotionItem);
        
        // Animate in
        setTimeout(() => {
            emotionItem.style.opacity = '1';
            emotionItem.style.transform = 'translateX(0)';
            
            // Animate progress bar
            const progressBar = emotionItem.querySelector('.emotion-progress');
            setTimeout(() => {
                progressBar.style.width = `${percentage}%`;
            }, 200);
        }, 50);
        
        // Add hover effects
        emotionItem.addEventListener('mouseenter', () => {
            emotionItem.style.transform = 'translateY(-2px) scale(1.02)';
            emotionItem.style.boxShadow = `0 8px 25px ${config.color}30`;
        });
        
        emotionItem.addEventListener('mouseleave', () => {
            emotionItem.style.transform = 'translateY(0) scale(1)';
            emotionItem.style.boxShadow = 'none';
        });
    }

    updateEmotionStatus() {
        const statusElement = document.querySelector('.emotion-status span:last-child');
        if (statusElement) {
            if (this.currentEmotions.length > 0) {
                const dominantEmotion = this.currentEmotions[0];
                statusElement.textContent = `Detecting - ${dominantEmotion}`;
            } else {
                statusElement.textContent = 'Analyzing...';
            }
        }
    }

    // Add emotion data to history for timeline and trends
    addToHistory(emotions, scores = {}) {
        const timestamp = new Date();
        const historyEntry = {
            timestamp: timestamp,
            emotions: emotions,
            scores: scores,
            dominantEmotion: emotions[0] || 'calm'
        };
        
        this.emotionHistory.unshift(historyEntry);
        
        // Keep only last 50 entries
        if (this.emotionHistory.length > 50) {
            this.emotionHistory = this.emotionHistory.slice(0, 50);
        }
        
        // Update trends
        this.updateEmotionTrends();
        
        // Update timeline display
        this.updateEmotionTimeline();
        
        // Update insights
        this.updateInsights();
    }

    updateEmotionTrends() {
        // Reset trends
        this.emotionTrends = {};
        
        // Calculate trends from history
        this.emotionHistory.forEach(entry => {
            entry.emotions.forEach(emotion => {
                if (!this.emotionTrends[emotion]) {
                    this.emotionTrends[emotion] = {
                        count: 0,
                        totalScore: 0,
                        avgScore: 0,
                        frequency: 0,
                        lastSeen: null
                    };
                }
                
                this.emotionTrends[emotion].count++;
                this.emotionTrends[emotion].totalScore += (entry.scores[emotion] || 0.7);
                this.emotionTrends[emotion].lastSeen = entry.timestamp;
            });
        });
        
        // Calculate averages and frequencies
        const totalEntries = this.emotionHistory.length;
        for (const emotion in this.emotionTrends) {
            const trend = this.emotionTrends[emotion];
            trend.avgScore = trend.totalScore / trend.count;
            trend.frequency = (trend.count / totalEntries) * 100;
        }
    }

    updateEmotionTimeline() {
        if (!this.emotionTimelineContainer) return;
        
        // Clear existing timeline
        this.emotionTimelineContainer.innerHTML = '';
        
        // Show last 8 entries
        const recentHistory = this.emotionHistory.slice(0, 8);
        
        if (recentHistory.length === 0) {
            this.emotionTimelineContainer.innerHTML = `
                <div class="timeline-empty">
                    <p>Timeline will update as you chat</p>
                </div>
            `;
            return;
        }
        
        recentHistory.forEach((entry, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.opacity = '0';
            timelineItem.style.transform = 'translateY(10px)';
            
            const timeStr = entry.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const dominantEmotion = entry.dominantEmotion;
            const config = this.emotionConfig[dominantEmotion];
            
            timelineItem.innerHTML = `
                <div class="timeline-emotion" style="color: ${config?.color || '#667eea'}">
                    ${config?.emoji || '😐'} ${dominantEmotion}
                </div>
                <div class="timeline-time">${timeStr}</div>
            `;
            
            this.emotionTimelineContainer.appendChild(timelineItem);
            
            // Animate in with delay
            setTimeout(() => {
                timelineItem.style.opacity = '1';
                timelineItem.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    updateInsights() {
        if (!this.emotionInsightsContainer) return;
        
        let insightText = "Start chatting to see your emotional patterns and insights.";
        
        if (this.emotionHistory.length > 0) {
            const insights = this.generateInsights();
            insightText = insights;
        }
        
        this.emotionInsightsContainer.innerHTML = `
            <div class="insight-card">
                <h4>💡 Emotional Insights</h4>
                <p>${insightText}</p>
            </div>
        `;
    }

    generateInsights() {
        if (this.emotionHistory.length < 3) {
            return "Keep chatting to unlock personalized insights about your emotional patterns.";
        }
        
        const recentEmotions = this.emotionHistory.slice(0, 5);
        const emotionCounts = {};
        
        // Count recent emotions
        recentEmotions.forEach(entry => {
            entry.emotions.forEach(emotion => {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
        });
        
        // Find dominant pattern
        const sortedEmotions = Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a);
        
        if (sortedEmotions.length === 0) return "No clear patterns detected yet.";
        
        const [topEmotion, topCount] = sortedEmotions[0];
        const config = this.emotionConfig[topEmotion];
        
        // Generate contextual insights
        const insights = [];
        
        if (topCount >= 3) {
            insights.push(`${config?.emoji || ''} You're experiencing a lot of ${topEmotion} lately.`);
            
            if (config?.intensity === 'positive') {
                insights.push("This is wonderful! Try to identify what's contributing to these positive feelings.");
            } else if (config?.intensity === 'negative') {
                insights.push("Consider some self-care activities or talking to someone you trust.");
            } else {
                insights.push("This emotional state can be an opportunity for self-reflection.");
            }
        } else {
            insights.push("You're showing a balanced mix of emotions, which is healthy and normal.");
        }
        
        // Add session insight
        const sessionDuration = Math.round((new Date() - this.emotionHistory[this.emotionHistory.length - 1]?.timestamp) / 60000);
        if (sessionDuration > 0) {
            insights.push(`You've been actively engaging for ${sessionDuration} minutes.`);
        }
        
        return insights.join(' ');
    }

    // Get emotion data for charts
    getEmotionData() {
        return {
            current: this.currentEmotions,
            scores: this.emotionScores,
            history: this.emotionHistory,
            trends: this.emotionTrends,
            config: this.emotionConfig
        };
    }

    // Get specific emotion trend data for charts
    getTrendData() {
        const labels = [];
        const datasets = {};
        
        // Prepare datasets for each emotion
        Object.keys(this.emotionConfig).forEach(emotion => {
            datasets[emotion] = {
                label: emotion,
                data: [],
                borderColor: this.emotionConfig[emotion].color,
                backgroundColor: this.emotionConfig[emotion].color + '20',
                tension: 0.4,
                fill: false
            };
        });
        
        // Process history data (last 20 entries, reversed for chronological order)
        const recentHistory = this.emotionHistory.slice(0, 20).reverse();
        
        recentHistory.forEach((entry, index) => {
            labels.push(entry.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }));
            
            // Initialize all emotions to 0 for this time point
            Object.keys(this.emotionConfig).forEach(emotion => {
                datasets[emotion].data.push(0);
            });
            
            // Set actual values for detected emotions
            entry.emotions.forEach(emotion => {
                if (datasets[emotion]) {
                    datasets[emotion].data[index] = entry.scores[emotion] || 0.7;
                }
            });
        });
        
        return {
            labels: labels,
            datasets: Object.values(datasets).filter(dataset => 
                dataset.data.some(value => value > 0)
            )
        };
    }

    // Get pie chart data for emotion distribution
    getPieChartData() {
        const emotionCounts = {};
        const emotionColors = [];
        
        // Count all emotions in history
        this.emotionHistory.forEach(entry => {
            entry.emotions.forEach(emotion => {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
        });
        
        const sortedEmotions = Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8); // Top 8 emotions
        
        const labels = sortedEmotions.map(([emotion]) => emotion);
        const data = sortedEmotions.map(([,count]) => count);
        
        // Get colors for each emotion
        labels.forEach(emotion => {
            emotionColors.push(this.emotionConfig[emotion]?.color || '#667eea');
        });
        
        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: emotionColors,
                borderColor: '#1a1a1a',
                borderWidth: 2
            }]
        };
    }

    // Start emotion update loop for real-time effects
    startEmotionUpdateLoop() {
        setInterval(() => {
            this.updateRealtimeEffects();
        }, 2000);
    }

    updateRealtimeEffects() {
        // Update status dot animation based on current emotions
        const statusDot = document.querySelector('.emotion-status .status-dot');
        if (statusDot && this.currentEmotions.length > 0) {
            const dominantEmotion = this.currentEmotions[0];
            const config = this.emotionConfig[dominantEmotion];
            
            if (config) {
                statusDot.style.background = config.color;
                statusDot.style.boxShadow = `0 0 10px ${config.color}`;
            }
        }
        
        // Add subtle glow effects to emotion items
        const emotionItems = document.querySelectorAll('.emotion-item');
        emotionItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 150);
            }, index * 100);
        });
    }

    // Public method to get summary for other components
    getEmotionalSummary() {
        if (this.emotionHistory.length === 0) {
            return {
                mood: 'neutral',
                trend: 'stable',
                intensity: 0.5,
                recommendations: ['Start chatting to track your emotions']
            };
        }
        
        const recentEmotions = this.emotionHistory.slice(0, 5);
        const positiveCount = recentEmotions.filter(entry => 
            entry.emotions.some(emotion => 
                this.emotionConfig[emotion]?.intensity === 'positive'
            )
        ).length;
        
        const negativeCount = recentEmotions.filter(entry => 
            entry.emotions.some(emotion => 
                this.emotionConfig[emotion]?.intensity === 'negative'
            )
        ).length;
        
        let mood = 'neutral';
        let trend = 'stable';
        let recommendations = [];
        
        if (positiveCount > negativeCount) {
            mood = 'positive';
            trend = 'improving';
            recommendations = [
                'Great emotional state! Keep doing what you\'re doing.',
                'Consider journaling about what\'s working well.'
            ];
        } else if (negativeCount > positiveCount) {
            mood = 'challenging';
            trend = 'needs attention';
            recommendations = [
                'Consider some self-care activities.',
                'Talking to someone you trust might help.',
                'Try deep breathing or mindfulness exercises.'
            ];
        } else {
            recommendations = [
                'Your emotions show a balanced pattern.',
                'Continue expressing yourself openly.'
            ];
        }
        
        const avgIntensity = recentEmotions.reduce((sum, entry) => {
            const entryIntensity = Math.max(...Object.values(entry.scores));
            return sum + entryIntensity;
        }, 0) / recentEmotions.length;
        
        return {
            mood,
            trend,
            intensity: avgIntensity || 0.5,
            recommendations
        };
    }
}

// Export for global use
window.EmotionSystem = EmotionSystem;
