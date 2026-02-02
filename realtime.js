/**
 * Real-time Updates Module for Team Dashboard
 * Implements WebSocket connection for live updates of agent status, 
 * task completion metrics, and project progress
 */

class RealtimeUpdates {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 3000; // 3 seconds
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.heartbeatDelay = 30000; // 30 seconds
        
        // Bind methods to preserve 'this' context
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.startHeartbeat = this.startHeartbeat.bind(this);
        this.stopHeartbeat = this.stopHeartbeat.bind(this);
        this.checkHeartbeat = this.checkHeartbeat.bind(this);
    }

    /**
     * Connect to WebSocket server
     */
    connect(url = 'ws://localhost:8080/ws') {
        if (this.isConnected) {
            console.warn('Already connected to WebSocket');
            return;
        }

        try {
            console.log('Attempting to connect to WebSocket:', url);
            this.ws = new WebSocket(url);

            this.ws.onopen = (event) => {
                console.log('WebSocket connection established');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Send initial subscription message
                this.subscribeToUpdates();
                
                // Start heartbeat
                this.startHeartbeat();
                
                // Notify listeners of connection
                this.dispatchCustomEvent('websocket-connected', { url });
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };

            this.ws.onerror = (event) => {
                console.error('WebSocket error:', event);
                this.handleError(event);
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                this.isConnected = false;
                
                // Stop heartbeat
                this.stopHeartbeat();
                
                // Attempt to reconnect if not intentional close
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                } else {
                    this.dispatchCustomEvent('websocket-disconnected', { 
                        code: event.code, 
                        reason: event.reason,
                        wasClean: event.wasClean 
                    });
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.handleError(error);
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Client initiated disconnect'); // 1000 = normal closure
            this.isConnected = false;
            this.stopHeartbeat();
        }
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
                // Use the same URL or derive from previous connection
                const wsUrl = this.ws.url || 'ws://localhost:8080/ws';
                this.connect(wsUrl);
            }
        }, this.reconnectDelay * this.reconnectAttempts); // Exponential backoff
    }

    /**
     * Subscribe to updates after connection
     */
    subscribeToUpdates() {
        const subscribeMessage = {
            type: 'subscribe',
            channels: ['agent-status', 'task-metrics', 'project-progress', 'activity-feed'],
            timestamp: Date.now()
        };
        
        this.sendMessage(subscribeMessage);
    }

    /**
     * Handle incoming messages
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            // Reset heartbeat timeout on any message received
            if (this.heartbeatTimeout) {
                clearTimeout(this.heartbeatTimeout);
                this.heartbeatTimeout = setTimeout(this.checkHeartbeat, this.heartbeatDelay);
            }
            
            switch (data.type) {
                case 'agent-status-update':
                    this.handleAgentStatusUpdate(data.payload);
                    break;
                case 'task-metrics-update':
                    this.handleTaskMetricsUpdate(data.payload);
                    break;
                case 'project-progress-update':
                    this.handleProjectProgressUpdate(data.payload);
                    break;
                case 'activity-feed-update':
                    this.handleActivityFeedUpdate(data.payload);
                    break;
                case 'bulk-update':
                    this.handleBulkUpdate(data.payload);
                    break;
                case 'heartbeat':
                    this.handleHeartbeatResponse(data.payload);
                    break;
                case 'pong':
                    // Response to our heartbeat
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
                    break;
            }
            
            // Dispatch custom event for UI components to listen to
            this.dispatchCustomEvent(`websocket-${data.type}`, data.payload);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error, event.data);
        }
    }

    /**
     * Handle agent status updates
     */
    handleAgentStatusUpdate(payload) {
        if (payload && typeof payload === 'object') {
            // Update agent cards in the dashboard
            this.updateAgentCards(payload);
        }
    }

    /**
     * Handle task metrics updates
     */
    handleTaskMetricsUpdate(payload) {
        if (payload && typeof payload === 'object') {
            // Update task completion metrics
            this.updateTaskMetrics(payload);
        }
    }

    /**
     * Handle project progress updates
     */
    handleProjectProgressUpdate(payload) {
        if (payload && typeof payload === 'object') {
            // Update project progress indicators
            this.updateProjectProgress(payload);
        }
    }

    /**
     * Handle activity feed updates
     */
    handleActivityFeedUpdate(payload) {
        if (payload && typeof payload === 'object') {
            // Add new activities to the feed
            this.updateActivityFeed(payload);
        }
    }

    /**
     * Handle bulk updates
     */
    handleBulkUpdate(payload) {
        if (payload && typeof payload === 'object') {
            // Handle multiple types of updates at once
            if (payload.agentStatus) {
                this.updateAgentCards(payload.agentStatus);
            }
            if (payload.taskMetrics) {
                this.updateTaskMetrics(payload.taskMetrics);
            }
            if (payload.projectProgress) {
                this.updateProjectProgress(payload.projectProgress);
            }
            if (payload.activityFeed) {
                this.updateActivityFeed(payload.activityFeed);
            }
        }
    }

    /**
     * Handle heartbeat response
     */
    handleHeartbeatResponse(payload) {
        console.log('Received heartbeat response:', payload);
        // Could update connection status UI here
    }

    /**
     * Send message to WebSocket server
     */
    sendMessage(message) {
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                console.log('Sent WebSocket message:', message);
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
            }
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }

    /**
     * Start heartbeat mechanism
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendMessage({
                    type: 'ping',
                    timestamp: Date.now()
                });
                
                // Set timeout to detect if pong is not received
                this.heartbeatTimeout = setTimeout(this.checkHeartbeat, this.heartbeatDelay);
            }
        }, this.heartbeatDelay);
    }

    /**
     * Stop heartbeat mechanism
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Check if heartbeat is still responding
     */
    checkHeartbeat() {
        console.warn('Heartbeat timeout - connection may be lost');
        // Force reconnection
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * Handle WebSocket errors
     */
    handleError(event) {
        console.error('WebSocket error occurred:', event);
        this.dispatchCustomEvent('websocket-error', { error: event });
    }

    /**
     * Handle WebSocket close
     */
    handleClose(event) {
        console.log('WebSocket closed:', event);
        this.isConnected = false;
        this.dispatchCustomEvent('websocket-close', { event });
    }

    /**
     * Update agent cards with new status
     */
    updateAgentCards(agentData) {
        if (!agentData || !Array.isArray(agentData)) return;
        
        agentData.forEach(agent => {
            const card = document.getElementById(`${agent.name}-card`);
            if (!card) return;
            
            const statusIndicator = card.querySelector('.status-indicator');
            const statusText = card.querySelector('.status-text');
            const taskText = card.querySelector('.task-text');
            
            if (!statusIndicator || !statusText || !taskText) return;
            
            // Reset classes
            statusIndicator.className = 'status-indicator';
            
            // Update status indicator
            switch(agent.status) {
                case 'active':
                    statusIndicator.classList.add('active');
                    statusText.textContent = `${agent.statusText}`;
                    statusText.className = 'status-text status-active';
                    break;
                case 'warning':
                    statusIndicator.classList.add('warning');
                    statusText.textContent = `${agent.statusText} - Attention needed`;
                    statusText.className = 'status-text status-warning';
                    break;
                case 'error':
                    statusIndicator.classList.add('error');
                    statusText.textContent = `${agent.statusText} - Error`;
                    statusText.className = 'status-text status-error';
                    break;
                case 'idle':
                    statusIndicator.classList.add('idle');
                    statusText.textContent = `${agent.statusText}`;
                    statusText.className = 'status-text status-idle';
                    break;
                default:
                    statusIndicator.classList.add('active');
                    statusText.textContent = agent.statusText;
                    statusText.className = 'status-text status-active';
            }
            
            // Update task text
            if (agent.task) {
                taskText.textContent = agent.task;
            }
        });
    }

    /**
     * Update task metrics
     */
    updateTaskMetrics(metrics) {
        if (!metrics) return;
        
        // Update summary statistics if they exist
        if (metrics.totalOpenIssues !== undefined) {
            const openIssuesEl = document.querySelector('[data-summary="open-issues"]');
            if (openIssuesEl) {
                openIssuesEl.textContent = metrics.totalOpenIssues;
            }
        }
        
        if (metrics.totalOpenPRs !== undefined) {
            const openPrsEl = document.querySelector('[data-summary="open-prs"]');
            if (openPrsEl) {
                openPrsEl.textContent = metrics.totalOpenPRs;
            }
        }
        
        if (metrics.totalMergedPRs !== undefined) {
            const mergedPrsEl = document.querySelector('[data-summary="merged-prs"]');
            if (mergedPrsEl) {
                mergedPrsEl.textContent = metrics.totalMergedPRs;
            }
        }
        
        // Update charts if they exist
        if (window.progressChart && metrics.chartData) {
            window.progressChart.data.datasets[0].data = metrics.chartData;
            window.progressChart.update();
        }
    }

    /**
     * Update project progress
     */
    updateProjectProgress(progressData) {
        if (!progressData) return;
        
        // Update progress indicators throughout the dashboard
        // This could include various progress bars, counters, etc.
        
        // Update repository status cards if present
        if (progressData.repositories && typeof progressData.repositories === 'object') {
            for (const [repoPath, repoData] of Object.entries(progressData.repositories)) {
                const repoCard = document.querySelector(`[data-repo="${repoPath}"]`);
                if (repoCard) {
                    if (repoData.issues?.open !== undefined) {
                        const issuesEl = repoCard.querySelector('.repo-issues-open');
                        if (issuesEl) {
                            issuesEl.textContent = repoData.issues.open;
                        }
                    }
                    
                    if (repoData.pullRequests?.open !== undefined) {
                        const prsEl = repoCard.querySelector('.repo-prs-open');
                        if (prsEl) {
                            prsEl.textContent = repoData.pullRequests.open;
                        }
                    }
                    
                    if (repoData.stars !== undefined) {
                        const starsEl = repoCard.querySelector('.repo-stars span');
                        if (starsEl) {
                            starsEl.textContent = repoData.stars;
                        }
                    }
                }
            }
        }
    }

    /**
     * Update activity feed
     */
    updateActivityFeed(activityData) {
        if (!activityData || !Array.isArray(activityData)) return;
        
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Add new activities (newest first)
        activityData.forEach(activity => {
            const li = document.createElement('li');
            li.className = `activity-item activity-${activity.type || 'info'}`;
            
            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'timestamp';
            timestampSpan.textContent = activity.timestamp || 'Just now';
            
            const messageSpan = document.createElement('span');
            messageSpan.className = 'activity-message';
            messageSpan.textContent = `[${activity.agent || 'system'}] ${activity.message || 'No message'}`;
            
            li.appendChild(messageSpan);
            li.appendChild(timestampSpan);
            
            // Insert at the beginning to show newest first
            activityList.insertBefore(li, activityList.firstChild);
        });
        
        // Limit the number of displayed activities to prevent overflow
        const maxActivities = 20;
        while (activityList.children.length > maxActivities) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    /**
     * Dispatch custom event for other parts of the application to listen to
     */
    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Check if WebSocket is currently connected
     */
    isConnected() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Initialize real-time updates when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create instance of RealtimeUpdates
    window.realtimeUpdates = new RealtimeUpdates();
    
    // Configuration for WebSocket server
    const config = {
        websocketUrl: window.DASHBOARD_CONFIG?.websocketUrl || 'ws://localhost:8080/ws',
        enableRealtime: window.DASHBOARD_CONFIG?.enableRealtime ?? true,
        reconnectInterval: window.DASHBOARD_CONFIG?.reconnectInterval || 3000
    };
    
    // Only connect if real-time updates are enabled
    if (config.enableRealtime) {
        console.log('Initializing real-time updates...');
        window.realtimeUpdates.connect(config.websocketUrl);
        
        // Listen for custom events to update UI elements
        document.addEventListener('websocket-agent-status-update', function(e) {
            console.log('Handling agent status update from WebSocket');
        });
        
        document.addEventListener('websocket-task-metrics-update', function(e) {
            console.log('Handling task metrics update from WebSocket');
        });
        
        document.addEventListener('websocket-project-progress-update', function(e) {
            console.log('Handling project progress update from WebSocket');
        });
        
        document.addEventListener('websocket-activity-feed-update', function(e) {
            console.log('Handling activity feed update from WebSocket');
        });
    } else {
        console.log('Real-time updates disabled in configuration');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RealtimeUpdates };
}