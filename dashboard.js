// Team Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up automatic updates
    setInterval(updateDashboard, 30000); // Update every 30 seconds
    
    // Initial update
    setTimeout(updateDashboard, 2000); // Update after 2 seconds to allow page to load
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

// Export functions for potential use by GitHub Actions or other integrations
window.TeamDashboard = {
    updateDashboard,
    initializeDashboard,
    fetchAgentStatus,
    fetchActivityFeed,
    initializeGitHubIntegration,
    saveGitHubToken,
    removeGitHubToken
};