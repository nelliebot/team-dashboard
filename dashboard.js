// Team Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up automatic updates (fallback if WebSocket fails)
    // Only set interval if real-time updates are not enabled
    if (!window.realtimeUpdates || !window.realtimeUpdates.isConnected()) {
        setInterval(updateDashboard, 30000); // Update every 30 seconds
    }
    
    // Initial update
    setTimeout(updateDashboard, 2000); // Update after 2 seconds to allow page to load
    
    // Listen for real-time updates
    if (window.realtimeUpdates) {
        // When WebSocket connects, we can stop the polling
        document.addEventListener('websocket-connected', function() {
            console.log('WebSocket connected, stopping periodic updates');
            // In a real implementation, we might clear the interval here
            // but we'll keep it as fallback for now
        });
        
        // When WebSocket disconnects, we might want to resume polling
        document.addEventListener('websocket-disconnected', function() {
            console.log('WebSocket disconnected, resuming periodic updates');
            // Resume periodic updates if connection is lost
            setInterval(updateDashboard, 30000);
        });
    }
});

function initializeDashboard() {
    // Set the current time
    updateTimeDisplay();
    
    // Initialize charts
    initializeCharts();
    
    // Initialize Mermaid
    mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });
    
    // Render initial collaboration diagram
    renderCollaborationDiagram();
    
    // Add initial activity
    addActivity("Dashboard initialized", "system");
}

function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}

async function updateDashboard() {
    console.log('Updating dashboard...');
    updateTimeDisplay();
    
    try {
        // Simulate fetching data from GitHub API
        const agentData = await fetchAgentStatus();
        updateAgentCards(agentData);
        
        // Simulate fetching activity data
        const activityData = await fetchActivityFeed();
        updateActivityFeed(activityData);
        
        // Update charts
        updateCharts();
        
        // Update collaboration diagram
        renderCollaborationDiagram();
        
        console.log('Dashboard updated successfully');
    } catch (error) {
        console.error('Error updating dashboard:', error);
        addActivity(`Error updating dashboard: ${error.message}`, "system", "error");
    }
}

async function fetchAgentStatus() {
    // Simulate API call to get agent status
    // In a real implementation, this would call the GitHub API
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    name: 'nellie',
                    status: 'active',
                    statusText: 'Active',
                    task: 'Working on link project development',
                    lastSeen: new Date()
                },
                {
                    name: 'callie',
                    status: 'warning',
                    statusText: 'Warning',
                    task: 'Monitoring systems',
                    lastSeen: new Date(Date.now() - 5 * 60000) // 5 minutes ago
                },
                {
                    name: 'berry',
                    status: 'active',
                    statusText: 'Active',
                    task: 'Processing data feeds',
                    lastSeen: new Date()
                },
                {
                    name: 'razzy',
                    status: 'idle',
                    statusText: 'Idle',
                    task: 'Waiting for tasks',
                    lastSeen: new Date(Date.now() - 30 * 60000) // 30 minutes ago
                },
                {
                    name: 'richie',
                    status: 'active',
                    statusText: 'Active',
                    task: 'Documentation updates',
                    lastSeen: new Date()
                }
            ]);
        }, 500); // Simulate network delay
    });
}

async function fetchActivityFeed() {
    // Simulate API call to get activity feed
    // In a real implementation, this would aggregate data from GitHub
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { timestamp: new Date(Date.now() - 300000), agent: 'nellie', message: 'Started work on link project API integration', type: 'development' },
                { timestamp: new Date(Date.now() - 240000), agent: 'berry', message: 'Processed 1,248 data points', type: 'processing' },
                { timestamp: new Date(Date.now() - 180000), agent: 'callie', message: 'System check completed', type: 'monitoring' },
                { timestamp: new Date(Date.now() - 120000), agent: 'richie', message: 'Updated documentation for team processes', type: 'documentation' },
                { timestamp: new Date(Date.now() - 60000), agent: 'nellie', message: 'Fixed bug in authentication module', type: 'bug-fix' }
            ]);
        }, 300); // Simulate network delay
    });
}

function updateAgentCards(agentData) {
    agentData.forEach(agent => {
        const card = document.getElementById(`${agent.name}-card`);
        const statusIndicator = card.querySelector('.status-indicator');
        const statusText = card.querySelector('.status-text');
        const taskText = card.querySelector('.task-text');
        
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
        taskText.textContent = agent.task;
    });
}

function updateActivityFeed(activityData) {
    const activityList = document.getElementById('activity-list');
    
    // Clear current items except the initial one
    while (activityList.children.length > 1) {
        activityList.removeChild(activityList.lastChild);
    }
    
    // Add new activities
    activityData.forEach(activity => {
        const li = document.createElement('li');
        li.className = `activity-item activity-${activity.type}`;
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = formatTimeAgo(activity.timestamp);
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'activity-message';
        messageSpan.textContent = `[${activity.agent}] ${activity.message}`;
        
        li.appendChild(messageSpan);
        li.appendChild(timestampSpan);
        
        activityList.insertBefore(li, activityList.firstChild);
    });
}

function addActivity(message, agent = 'system', type = 'info') {
    const activityList = document.getElementById('activity-list');
    const li = document.createElement('li');
    li.className = `activity-item activity-${type}`;
    
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = 'Just now';
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'activity-message';
    messageSpan.textContent = `[${agent}] ${message}`;
    
    li.appendChild(messageSpan);
    li.appendChild(timestampSpan);
    
    activityList.insertBefore(li, activityList.firstChild);
}

function initializeCharts() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Sample data for the chart
    const data = {
        labels: ['Nellie', 'Callie', 'Berry', 'Razzy', 'Richie'],
        datasets: [{
            label: 'Task Completion %',
            data: [75, 60, 85, 30, 70],
            backgroundColor: [
                'rgba(74, 111, 165, 0.2)',
                'rgba(40, 167, 69, 0.2)',
                'rgba(255, 193, 7, 0.2)',
                'rgba(220, 53, 69, 0.2)',
                'rgba(23, 162, 184, 0.2)'
            ],
            borderColor: [
                'rgb(74, 111, 165)',
                'rgb(40, 167, 69)',
                'rgb(255, 193, 7)',
                'rgb(220, 53, 69)',
                'rgb(23, 162, 184)'
            ],
            borderWidth: 1
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    };
    
    window.progressChart = new Chart(ctx, config);
}

function updateCharts() {
    if (window.progressChart) {
        // Generate new random data for demo purposes
        const newData = Array.from({length: 5}, () => Math.floor(Math.random() * 100));
        window.progressChart.data.datasets[0].data = newData;
        window.progressChart.update();
    }
}

function renderCollaborationDiagram() {
    // This is a simplified version - in a real implementation we'd generate this dynamically
    const collaborationData = `
        graph LR
            A[Nellie<br/>Active] --> B[Callie<br/>Monitoring]
            B --> C[Berry<br/>Processing]
            C --> D[Razzy<br/>Idle]
            D --> E[Richie<br/>Docs]
            E --> A
            F[System<br/>Health] -.-> A
            F -.-> C
    `;
    
    // Update the diagram content
    const diagramElement = document.getElementById('collaboration-diagram');
    diagramElement.innerHTML = `<pre>${collaborationData}</pre>`;
    
    // Render with Mermaid
    mermaid.init(undefined, diagramElement.querySelectorAll('pre'));
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    
    if (diffHrs >= 1) {
        return `${diffHrs}h ago`;
    } else if (diffMins >= 1) {
        return `${diffMins}m ago`;
    } else {
        return 'Just now';
    }
}

// GitHub API Integration Functions
// These would be implemented to connect to GitHub APIs in a real scenario
async function fetchGitHubData() {
    // Placeholder for GitHub API integration
    // Would fetch real data from GitHub issues, PRs, etc.
    console.log('Fetching GitHub data...');
    
    // Example of how we might fetch data:
    // const response = await fetch('https://api.github.com/repos/username/repo/issues');
    // return response.json();
}

// GitHub API Integration
let githubApi = null;
let dashboardAggregator = null;

// Initialize GitHub integration if token is available
async function initializeGitHubIntegration() {
    // Check for stored GitHub token
    const token = localStorage.getItem('github-token');
    
    if (token) {
        try {
            githubApi = new GitHubAPI(token);
            dashboardAggregator = new DashboardDataAggregator(githubApi);
            
            // Update dashboard with GitHub data
            const rawData = await dashboardAggregator.collectAllData();
            const formattedData = dashboardAggregator.formatForDashboard(rawData);
            
            updateDashboardWithData(formattedData);
            addActivity("GitHub integration activated", "system", "info");
        } catch (error) {
            console.error('Error with GitHub integration:', error);
            addActivity(`GitHub integration error: ${error.message}`, "system", "error");
        }
    } else {
        addActivity("GitHub token not found - integration disabled", "system", "warning");
    }
}

// Function to save GitHub token
function saveGitHubToken(token) {
    localStorage.setItem('github-token', token);
    addActivity("GitHub token saved", "system", "info");
    initializeGitHubIntegration(); // Re-initialize with the new token
}

// Function to remove GitHub token
function removeGitHubToken() {
    localStorage.removeItem('github-token');
    addActivity("GitHub token removed", "system", "info");
    githubApi = null;
    dashboardAggregator = null;
}

// Enhanced update function that includes GitHub data
async function updateDashboard() {
    console.log('Updating dashboard...');
    updateTimeDisplay();
    
    try {
        // Update agent status cards
        const agentData = await fetchAgentStatus();
        updateAgentCards(agentData);
        
        // Update activity feed
        const activityData = await fetchActivityFeed();
        updateActivityFeed(activityData);
        
        // Update charts
        updateCharts();
        
        // Update collaboration diagram
        renderCollaborationDiagram();
        
        // If GitHub integration is available, update with GitHub data
        if (dashboardAggregator) {
            try {
                const rawData = await dashboardAggregator.collectAllData();
                const formattedData = dashboardAggregator.formatForDashboard(rawData);
                updateDashboardWithData(formattedData);
            } catch (error) {
                console.error('Error updating with GitHub data:', error);
                addActivity(`GitHub data update error: ${error.message}`, "system", "error");
            }
        }
        
        console.log('Dashboard updated successfully');
    } catch (error) {
        console.error('Error updating dashboard:', error);
        addActivity(`Error updating dashboard: ${error.message}`, "system", "error");
    }
}

// Function to load collaboration data from JSON file
async function loadCollaborationData() {
    try {
        const response = await fetch('collaboration-data.json');
        if (response.ok) {
            return await response.json();
        } else {
            console.warn('Collaboration data file not found, using default data');
            return getDefaultCollaborationData();
        }
    } catch (error) {
        console.warn('Error loading collaboration data:', error);
        return getDefaultCollaborationData();
    }
}

// Default collaboration data for fallback
function getDefaultCollaborationData() {
    return {
        updatedAt: new Date().toISOString(),
        collaborationNetwork: [
            { source: "nellie", target: "callie", weight: 8, type: "communication" },
            { source: "nellie", target: "berry", weight: 9, type: "problem-solving" },
            { source: "berry", target: "nellie", weight: 7, type: "code-review" },
            { source: "callie", target: "berry", weight: 6, type: "communication" },
            { source: "nellie", target: "razzy", weight: 5, type: "task-assignment" },
            { source: "berry", target: "richie", weight: 7, type: "problem-solving" },
            { source: "richie", target: "nellie", weight: 4, type: "communication" },
            { source: "razzy", target: "callie", weight: 3, type: "communication" },
            { source: "callie", target: "richie", weight: 2, type: "planning" },
            { source: "berry", target: "razzy", weight: 4, type: "code-review" }
        ],
        interactionCounts: {
            "nellie": { opened: 15, commented: 22, assigned: 8, totalInteractions: 45 },
            "callie": { opened: 10, commented: 18, assigned: 5, totalInteractions: 33 },
            "berry": { opened: 18, commented: 25, assigned: 12, totalInteractions: 55 },
            "razzy": { opened: 5, commented: 8, assigned: 3, totalInteractions: 16 },
            "richie": { opened: 8, commented: 15, assigned: 6, totalInteractions: 29 }
        },
        projectAssignments: {
            "nellie": [
                { title: "Link Project Development", state: "open", createdAt: new Date().toISOString() },
                { title: "System Architecture Planning", state: "open", createdAt: new Date().toISOString() },
                { title: "Team Coordination", state: "open", createdAt: new Date().toISOString() }
            ],
            "callie": [
                { title: "Monitoring Systems", state: "open", createdAt: new Date().toISOString() },
                { title: "Dashboard Enhancement", state: "open", createdAt: new Date().toISOString() }
            ],
            "berry": [
                { title: "Data Processing Module", state: "open", createdAt: new Date().toISOString() },
                { title: "Performance Optimization", state: "open", createdAt: new Date().toISOString() },
                { title: "API Development", state: "open", createdAt: new Date().toISOString() }
            ],
            "razzy": [
                { title: "Support Tasks", state: "open", createdAt: new Date().toISOString() },
                { title: "Bug Fixes", state: "open", createdAt: new Date().toISOString() }
            ],
            "richie": [
                { title: "Documentation Update", state: "open", createdAt: new Date().toISOString() },
                { title: "User Guide Creation", state: "open", createdAt: new Date().toISOString() }
            ]
        }
    };
}

// Enhanced collaboration diagram renderer that uses real data
function renderCollaborationDiagram() {
    loadCollaborationData().then(data => {
        // Generate Mermaid diagram based on collaboration data
        const collaborationData = generateMermaidDiagram(data);
        
        // Update the diagram content
        const diagramElement = document.getElementById('collaboration-diagram');
        if (diagramElement) {
            diagramElement.innerHTML = `<pre class="mermaid">${collaborationData}</pre>`;
            
            // Render with Mermaid if available
            if (typeof mermaid !== 'undefined') {
                mermaid.init(undefined, diagramElement.querySelectorAll('.mermaid'));
            }
        }
    }).catch(error => {
        console.error('Error rendering collaboration diagram:', error);
    });
}

// Generate Mermaid diagram from collaboration data
function generateMermaidDiagram(data) {
    let diagram = 'graph LR\n';
    
    // Add agent nodes with their roles and activity levels
    const agents = Object.keys(data.interactionCounts);
    agents.forEach(agent => {
        const count = data.interactionCounts[agent];
        const activity = count.totalInteractions > 30 ? 'high' : count.totalInteractions > 15 ? 'medium' : 'low';
        
        diagram += `    ${agent.toUpperCase()}[${agent.charAt(0).toUpperCase() + agent.slice(1)}<br/>${activity} activity<br/>${count.totalInteractions} interactions]\n`;
    });
    
    // Add connections between agents
    data.collaborationNetwork.forEach(connection => {
        if (connection.source !== connection.target) { // Skip self-connections
            const weightSymbol = connection.weight > 6 ? '==' : connection.weight > 3 ? '=' : '-';
            diagram += `    ${connection.source.toUpperCase()} ${weightSymbol}${weightSymbol}> ${connection.target.toUpperCase()}\n`;
        }
    });
    
    return diagram;
}

// Export functions for potential use by GitHub Actions or other integrations
window.TeamDashboard = {
    updateDashboard,
    initializeDashboard,
    fetchAgentStatus,
    fetchActivityFeed,
    initializeGitHubIntegration,
    saveGitHubToken,
    removeGitHubToken,
    loadCollaborationData,
    renderCollaborationDiagram
};