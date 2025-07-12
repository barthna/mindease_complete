// Enhanced Chart Management for MindEase Emotion Analysis
class ChartManager {
    constructor() {
        this.trendChart = null;
        this.pieChart = null;
        this.isChartsInitialized = false;
        this.chartColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#4facfe',
            success: '#4ade80',
            warning: '#fbbf24',
            error: '#ef4444',
            info: '#06b6d4'
        };
        
        this.initializeCharts();
        this.setupChartEventListeners();
    }

    initializeCharts() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.initializeCharts(), 100);
            return;
        }
        
        // Configure Chart.js defaults for dark theme
        Chart.defaults.color = '#b0b0b0';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.12)';
        Chart.defaults.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.padding = 20;
        Chart.defaults.elements.point.radius = 4;
        Chart.defaults.elements.point.hoverRadius = 6;
        Chart.defaults.elements.line.tension = 0.4;
        
        this.initializeTrendChart();
        this.initializePieChart();
        this.isChartsInitialized = true;
    }

    initializeTrendChart() {
        const trendCanvas = document.getElementById('emotionTrendChart');
        if (!trendCanvas) return;
        
        const ctx = trendCanvas.getContext('2d');
        
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 15,
                            font: {
                                size: 11
                            },
                            filter: function(legendItem, chartData) {
                                // Only show emotions that have data
                                const dataset = chartData.datasets[legendItem.datasetIndex];
                                return dataset && dataset.data.some(value => value > 0);
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(12, 12, 12, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#b0b0b0',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return `Time: ${context[0].label}`;
                            },
                            label: function(context) {
                                const emotion = context.dataset.label;
                                const value = Math.round(context.parsed.y * 100);
                                return `${emotion}: ${value}% intensity`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.08)',
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        display: true,
                        min: 0,
                        max: 1,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.08)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return Math.round(value * 100) + '%';
                            },
                            font: {
                                size: 10
                            },
                            stepSize: 0.25
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 5,
                        borderWidth: 2
                    },
                    line: {
                        borderWidth: 2,
                        fill: false
                    }
                }
            }
        });
    }

    initializePieChart() {
        const pieCanvas = document.getElementById('emotionPieChart');
        if (!pieCanvas) return;
        
        const ctx = pieCanvas.getContext('2d');
        
        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: '#1a1a1a',
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 12,
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[i];
                                        const total = dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = Math.round((value / total) * 100);
                                        
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: dataset.backgroundColor[i],
                                            strokeStyle: dataset.borderColor,
                                            lineWidth: dataset.borderWidth,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(12, 12, 12, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#b0b0b0',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                const count = context.parsed;
                                return `${count} occurrences (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                hover: {
                    animationDuration: 200
                }
            }
        });
    }

    setupChartEventListeners() {
        // Listen for emotion updates
        document.addEventListener('emotionUpdate', () => {
            this.updateCharts();
        });
        
        // Resize charts when window resizes
        window.addEventListener('resize', () => {
            if (this.trendChart) this.trendChart.resize();
            if (this.pieChart) this.pieChart.resize();
        });
        
        // Update charts when sidebar is toggled
        const rightSidebar = document.getElementById('rightSidebar');
        if (rightSidebar) {
            const observer = new MutationObserver(() => {
                setTimeout(() => {
                    if (this.trendChart) this.trendChart.resize();
                    if (this.pieChart) this.pieChart.resize();
                }, 300);
            });
            
            observer.observe(rightSidebar, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    updateCharts() {
        if (!this.isChartsInitialized || !window.emotionSystem) return;
        
        this.updateTrendChart();
        this.updatePieChart();
        this.updateSummaries();
    }

    updateTrendChart() {
        if (!this.trendChart || !window.emotionSystem) return;
        
        const trendData = window.emotionSystem.getTrendData();
        
        // Update chart data with smooth animation
        this.trendChart.data.labels = trendData.labels;
        this.trendChart.data.datasets = trendData.datasets;
        
        // Animate the update
        this.trendChart.update('active');
        
        // Update trend summary
        this.updateTrendSummary(trendData);
    }

    updatePieChart() {
        if (!this.pieChart || !window.emotionSystem) return;
        
        const pieData = window.emotionSystem.getPieChartData();
        
        if (pieData.labels.length === 0) {
            // Show empty state
            this.showEmptyPieChart();
            return;
        }
        
        // Update chart data
        this.pieChart.data.labels = pieData.labels;
        this.pieChart.data.datasets[0].data = pieData.datasets[0].data;
        this.pieChart.data.datasets[0].backgroundColor = pieData.datasets[0].backgroundColor;
        
        // Animate the update
        this.pieChart.update('active');
        
        // Update pattern summary
        this.updatePatternSummary(pieData);
    }

    showEmptyPieChart() {
        this.pieChart.data.labels = ['No data yet'];
        this.pieChart.data.datasets[0].data = [1];
        this.pieChart.data.datasets[0].backgroundColor = ['rgba(255, 255, 255, 0.1)'];
        this.pieChart.update('none');
    }

    updateTrendSummary(trendData) {
        const summaryElement = document.getElementById('trendSummary');
        if (!summaryElement) return;
        
        if (!trendData || trendData.datasets.length === 0) {
            summaryElement.innerHTML = `
                <div class="summary-card">
                    <h4>📈 Emotion Trends</h4>
                    <p>Start chatting to see your emotion trends over time. The chart will show how your emotions change during our conversation.</p>
                </div>
            `;
            return;
        }
        
        // Analyze trends
        const analysis = this.analyzeTrends(trendData);
        
        summaryElement.innerHTML = `
            <div class="summary-card">
                <h4>📈 Emotion Trends</h4>
                <div class="trend-stats">
                    <div class="stat">
                        <span class="stat-label">Dominant Emotion:</span>
                        <span class="stat-value">${analysis.dominant}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Trend Direction:</span>
                        <span class="stat-value ${analysis.direction.toLowerCase()}">${analysis.direction}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Variability:</span>
                        <span class="stat-value">${analysis.variability}</span>
                    </div>
                </div>
                <p class="trend-insight">${analysis.insight}</p>
            </div>
        `;
    }

    updatePatternSummary(pieData) {
        const summaryElement = document.getElementById('patternSummary');
        if (!summaryElement) return;
        
        if (!pieData || pieData.labels.length === 0) {
            summaryElement.innerHTML = `
                <div class="summary-card">
                    <h4>🎯 Emotion Patterns</h4>
                    <p>Emotion patterns will appear as you chat more. This will help identify your most common emotional states.</p>
                </div>
            `;
            return;
        }
        
        // Analyze patterns
        const analysis = this.analyzePatterns(pieData);
        
        summaryElement.innerHTML = `
            <div class="summary-card">
                <h4>🎯 Emotion Patterns</h4>
                <div class="pattern-stats">
                    <div class="stat">
                        <span class="stat-label">Most Frequent:</span>
                        <span class="stat-value">${analysis.mostFrequent.emotion} (${analysis.mostFrequent.percentage}%)</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Diversity:</span>
                        <span class="stat-value">${analysis.diversity}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Balance:</span>
                        <span class="stat-value ${analysis.balance.type}">${analysis.balance.description}</span>
                    </div>
                </div>
                <p class="pattern-insight">${analysis.insight}</p>
            </div>
        `;
    }

    analyzeTrends(trendData) {
        const datasets = trendData.datasets;
        let dominantEmotion = 'Balanced';
        let direction = 'Stable';
        let variability = 'Low';
        let insight = 'Your emotions are showing a stable pattern.';
        
        if (datasets.length > 0) {
            // Find dominant emotion (highest average)
            let maxAvg = 0;
            datasets.forEach(dataset => {
                const avg = dataset.data.reduce((a, b) => a + b, 0) / dataset.data.length;
                if (avg > maxAvg) {
                    maxAvg = avg;
                    dominantEmotion = dataset.label;
                }
            });
            
            // Analyze direction (comparing first and last thirds)
            const primaryDataset = datasets[0];
            if (primaryDataset && primaryDataset.data.length >= 6) {
                const firstThird = primaryDataset.data.slice(0, Math.floor(primaryDataset.data.length / 3));
                const lastThird = primaryDataset.data.slice(-Math.floor(primaryDataset.data.length / 3));
                
                const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
                const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;
                
                const change = lastAvg - firstAvg;
                if (change > 0.1) direction = 'Improving';
                else if (change < -0.1) direction = 'Declining';
                else direction = 'Stable';
            }
            
            // Calculate variability
            const allValues = datasets.flatMap(d => d.data);
            const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
            const variance = allValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allValues.length;
            const stdDev = Math.sqrt(variance);
            
            if (stdDev > 0.25) variability = 'High';
            else if (stdDev > 0.15) variability = 'Moderate';
            else variability = 'Low';
            
            // Generate insight
            if (direction === 'Improving') {
                insight = `Great! Your ${dominantEmotion} is trending upward. Keep doing what's working for you.`;
            } else if (direction === 'Declining') {
                insight = `Your emotions show a declining trend. Consider some self-care or talking to someone you trust.`;
            } else {
                insight = `Your emotions are stable with ${dominantEmotion} being prominent. This consistency can be positive.`;
            }
        }
        
        return {
            dominant: dominantEmotion,
            direction: direction,
            variability: variability,
            insight: insight
        };
    }

    analyzePatterns(pieData) {
        const labels = pieData.labels;
        const data = pieData.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        
        // Most frequent emotion
        const maxIndex = data.indexOf(Math.max(...data));
        const mostFrequent = {
            emotion: labels[maxIndex],
            percentage: Math.round((data[maxIndex] / total) * 100)
        };
        
        // Diversity calculation
        const diversity = data.length >= 5 ? 'High' : data.length >= 3 ? 'Moderate' : 'Low';
        
        // Balance analysis
        let balance = { type: 'balanced', description: 'Balanced' };
        if (mostFrequent.percentage > 60) {
            balance = { type: 'concentrated', description: 'Concentrated' };
        } else if (mostFrequent.percentage < 30) {
            balance = { type: 'distributed', description: 'Well-distributed' };
        }
        
        // Generate insight
        let insight = `Your emotional patterns show ${diversity.toLowerCase()} diversity with ${mostFrequent.emotion} being most common.`;
        
        if (balance.type === 'concentrated') {
            insight += ' This concentration might indicate a consistent emotional state.';
        } else if (balance.type === 'distributed') {
            insight += ' This distribution suggests emotional flexibility and range.';
        }
        
        return {
            mostFrequent: mostFrequent,
            diversity: diversity,
            balance: balance,
            insight: insight
        };
    }

    updateSummaries() {
        if (!window.emotionSystem) return;
        
        const emotionalSummary = window.emotionSystem.getEmotionalSummary();
        this.updateInsightsTab(emotionalSummary);
    }

    updateInsightsTab(summary) {
        const insightsContent = document.getElementById('insightsContent');
        if (!insightsContent) return;
        
        const moodColor = this.getMoodColor(summary.mood);
        const intensityBar = Math.round(summary.intensity * 100);
        
        insightsContent.innerHTML = `
            <div class="insights-grid">
                <div class="insight-card mood-card">
                    <h4 style="color: ${moodColor}">🎭 Current Mood</h4>
                    <div class="mood-indicator">
                        <span class="mood-label">${summary.mood}</span>
                        <div class="mood-bar">
                            <div class="mood-progress" style="width: ${intensityBar}%; background: ${moodColor}"></div>
                        </div>
                        <span class="mood-intensity">${intensityBar}% intensity</span>
                    </div>
                    <p class="mood-trend">Trend: ${summary.trend}</p>
                </div>
                
                <div class="insight-card recommendations-card">
                    <h4>💡 Recommendations</h4>
                    <ul class="recommendations-list">
                        ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-card session-card">
                    <h4>📊 Session Summary</h4>
                    <div class="session-stats">
                        <div class="session-stat">
                            <span class="stat-icon">💬</span>
                            <span class="stat-text">Messages: ${window.mindEaseChat?.messageCount || 0}</span>
                        </div>
                        <div class="session-stat">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-text">Duration: ${this.getSessionDuration()}</span>
                        </div>
                        <div class="session-stat">
                            <span class="stat-icon">🎯</span>
                            <span class="stat-text">Emotions: ${Object.keys(window.emotionSystem?.emotionTrends || {}).length}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for insights if not already added
        this.addInsightsStyles();
    }

    getMoodColor(mood) {
        const colors = {
            'positive': '#4ade80',
            'challenging': '#ef4444',
            'neutral': '#06b6d4',
            'improving': '#10b981',
            'stable': '#667eea'
        };
        return colors[mood] || '#667eea';
    }

    getSessionDuration() {
        if (!window.mindEaseChat?.sessionStartTime) return '0m';
        
        const duration = new Date() - window.mindEaseChat.sessionStartTime;
        const minutes = Math.floor(duration / 60000);
        
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    addInsightsStyles() {
        if (document.getElementById('insights-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'insights-styles';
        style.textContent = `
            .insights-grid {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .insight-card {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 16px;
                transition: all 0.3s ease;
            }
            
            .insight-card:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .insight-card h4 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .mood-indicator {
                margin-bottom: 8px;
            }
            
            .mood-label {
                font-weight: 600;
                text-transform: capitalize;
                font-size: 16px;
            }
            
            .mood-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                margin: 8px 0;
                overflow: hidden;
            }
            
            .mood-progress {
                height: 100%;
                border-radius: 3px;
                transition: width 0.8s ease;
            }
            
            .mood-intensity {
                font-size: 12px;
                color: var(--text-muted);
            }
            
            .mood-trend {
                font-size: 12px;
                color: var(--text-secondary);
                margin: 0;
            }
            
            .recommendations-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .recommendations-list li {
                padding: 6px 0;
                font-size: 13px;
                color: var(--text-secondary);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                position: relative;
                padding-left: 16px;
            }
            
            .recommendations-list li:last-child {
                border-bottom: none;
            }
            
            .recommendations-list li::before {
                content: "•";
                color: var(--accent-color, #667eea);
                position: absolute;
                left: 0;
            }
            
            .session-stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .session-stat {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--text-secondary);
            }
            
            .stat-icon {
                font-size: 14px;
            }
            
            .summary-card {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 16px;
            }
            
            .summary-card h4 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 12px;
                color: var(--text-primary);
            }
            
            .trend-stats, .pattern-stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
            }
            
            .stat-label {
                color: var(--text-secondary);
            }
            
            .stat-value {
                color: var(--text-primary);
                font-weight: 600;
            }
            
            .stat-value.improving {
                color: var(--success-color);
            }
            
            .stat-value.declining {
                color: var(--error-color);
            }
            
            .stat-value.stable {
                color: var(--info-color);
            }
            
            .stat-value.concentrated {
                color: var(--warning-color);
            }
            
            .stat-value.distributed {
                color: var(--success-color);
            }
            
            .trend-insight, .pattern-insight {
                font-size: 12px;
                color: var(--text-secondary);
                line-height: 1.4;
                margin: 0;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Manually trigger chart updates
    refreshCharts() {
        if (this.trendChart) {
            this.trendChart.resize();
            this.trendChart.update();
        }
        
        if (this.pieChart) {
            this.pieChart.resize();
            this.pieChart.update();
        }
    }

    // Destroy charts (for cleanup)
    destroy() {
        if (this.trendChart) {
            this.trendChart.destroy();
            this.trendChart = null;
        }
        
        if (this.pieChart) {
            this.pieChart.destroy();
            this.pieChart = null;
        }
        
        this.isChartsInitialized = false;
    }

    // Export chart data
    exportChartData() {
        if (!window.emotionSystem) return null;
        
        const emotionData = window.emotionSystem.getEmotionData();
        const trendData = window.emotionSystem.getTrendData();
        const pieData = window.emotionSystem.getPieChartData();
        
        return {
            timestamp: new Date().toISOString(),
            trends: trendData,
            patterns: pieData,
            summary: window.emotionSystem.getEmotionalSummary(),
            rawData: emotionData
        };
    }
}

// Export for global use
window.ChartManager = ChartManager;
