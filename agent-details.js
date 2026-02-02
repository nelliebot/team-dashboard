// Agent Details Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize agent details page
    initializeAgentDetailsPage();
    
    // Set up agent switching
    setupAgentTabs();
    
    // Set up automatic updates
    setInterval(updateAgentDetails, 30000); // Update every 30 seconds
});

function initializeAgentDetailsPage() {
    // Set the current time
    updateTimeDisplay();
    
    // Initialize charts
    initializeAgentCharts();
    
    // Initialize Mermaid
    mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
    });
    
    // Load data for the default agent (Nellie)
    loadAgentData('nellie');
}

function setupAgentTabs() {
    const tabs = document.querySelectorAll('.agent-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Load data for selected agent
            const agentId = this.getAttribute('data-agent');
            loadAgentData(agentId);
        });
    });
}

function loadAgentData(agentId) {
    // Update the agent details based on the selected agent
    updateAgentHeader(agentId);
    updateAgentStats(agentId);
    updateAgentActivity(agentId);
    updateAgentCharts(agentId);
    updateCollaborationDiagram(agentId);
}

function updateAgentHeader(agentId) {
    // Get agent configuration from dashboard
    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            const agent = config.agents.find(a => a.id === agentId);
            if (agent) {
                document.getElementById('detail-agent-name').textContent = agent.name;
                document.getElementById('detail-agent-role').textContent = agent.role;
                
                // Update status indicator color based on agent
                const statusIndicator = document.getElementById('detail-status-indicator');
                statusIndicator.style.backgroundColor = agent.color;
            }
        })
        .catch(error => {
            console.error('Error loading agent config:', error);
        });
}

function updateAgentStats(agentId) {
    // Simulate getting agent stats
    // In a real implementation, this would come from actual data
    const stats = getSimulatedAgentStats(agentId);
    
    document.getElementById('detail-task-completion').textContent = stats.completion + '%';
    document.getElementById('detail-activity-level').textContent = stats.activityLevel;
    document.getElementById('detail-collaboration').textContent = stats.collaboration + '/10';
    document.getElementById('detail-uptime').textContent = stats.uptime + '%';
    
    // Update status indicator class based on activity level
    const statusIndicator = document.getElementById('detail-status-indicator');
    statusIndicator.className = 'status-indicator';
    
    if (stats.activityLevel.toLowerCase() === 'high' || stats.activityLevel.toLowerCase() === 'active') {
        statusIndicator.classList.add('active');
    } else if (stats.activityLevel.toLowerCase() === 'medium' || stats.activityLevel.toLowerCase() === 'warning') {
        statusIndicator.classList.add('warning');
    } else if (stats.activityLevel.toLowerCase() === 'low' || stats.activityLevel.toLowerCase() === 'idle') {
        statusIndicator.classList.add('idle');
    } else {
        statusIndicator.classList.add('error');
    }
}

function getSimulatedAgentStats(agentId) {
    // Simulate different stats for different agents
    const baseStats = {
        nellie: { completion: 75, activityLevel: 'High', collaboration: 8, uptime: 98 },
        callie: { completion: 60, activityLevel: 'Medium', collaboration: 7, uptime: 95 },
        berry: { completion: 85, activityLevel: 'High', collaboration: 9, uptime: 99 },
        razzy: { completion: 30, activityLevel: 'Low', collaboration: 5, uptime: 90 },
        richie: { completion: 70, activityLevel: 'High', collaboration: 7, uptime: 96 }
    };
    
    return baseStats[agentId] || baseStats.nellie;
}

async function updateAgentActivity(agentId) {
    // Simulate fetching agent-specific activity
    const activities = await fetchAgentSpecificActivity(agentId);
    
    const activityList = document.getElementById('agent-activity-list');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'activity-time';
        timeDiv.textContent = formatTimeAgo(new Date(activity.timestamp));
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'activity-content';
        
        const typeSpan = document.createElement('span');
        typeSpan.className = `activity-type activity-${activity.type}`;
        typeSpan.textContent = activity.type.toUpperCase();
        
        const messageP = document.createElement('p');
        messageP.textContent = activity.message;
        
        contentDiv.appendChild(typeSpan);
        contentDiv.appendChild(messageP);
        
        li.appendChild(timeDiv);
        li.appendChild(contentDiv);
        
        activityList.appendChild(li);
    });
}

async function fetchAgentSpecificActivity(agentId) {
    // Simulate API call to get agent-specific activity
    return new Promise(resolve => {
        setTimeout(() => {
            const activities = {
                nellie: [
                    { timestamp: new Date(Date.now() - 10000), type: 'development', message: 'Started work on link project API integration' },
                    { timestamp: new Date(Date.now() - 120000), type: 'bug-fix', message: 'Fixed authentication module bug' },
                    { timestamp: new Date(Date.now() - 360000), type: 'review', message: 'Reviewed PR #42 for dashboard enhancements' },
                    { timestamp: new Date(Date.now() - 86400000), type: 'meeting', message: 'Attended team planning meeting' }
                ],
                callie: [
                    { timestamp: new Date(Date.now() - 30000), type: 'monitoring', message: 'System health check completed' },
                    { timestamp: new Date(Date.now() - 300000), type: 'alert', message: 'Resolved performance issue in data processing module' },
                    { timestamp: new Date(Date.now() - 7200000), type: 'maintenance', message: 'Performed routine system maintenance' }
                ],
                berry: [
                    { timestamp: new Date(Date.now() - 45000), type: 'processing', message: 'Processed 1,248 data points successfully' },
                    { timestamp: new Date(Date.now() - 180000), type: 'analysis', message: 'Completed data analysis for Q4 report' },
                    { timestamp: new Date(Date.now() - 43200000), type: 'optimization', message: 'Optimized data pipeline for better performance' }
                ],
                razzy: [
                    { timestamp: new Date(Date.now() - 600000), type: 'support', message: 'Assisted with documentation queries' },
                    { timestamp: new Date(Date.now() - 172800000), type: 'task', message: 'Completed assigned research task' }
                ],
                richie: [
                    { timestamp: new Date(Date.now() - 90000), type: 'documentation', message: 'Updated API documentation' },
                    { timestamp: new Date(Date.now() - 240000), type: 'writing', message: 'Created user guide for new feature' },
                    { timestamp: new Date(Date.now() - 43200000), type: 'review', message: 'Reviewed and improved existing documentation' }
                ]
            };
            
            resolve(activities[agentId] || activities.nellie);
        }, 300);
    });
}

function initializeAgentCharts() {
    // Initialize weekly contribution chart
    const weeklyCtx = document.getElementById('weekly-chart').getContext('2d');
    window.weeklyChart = new Chart(weeklyCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tasks Completed',
                data: [5, 8, 6, 9, 7, 3, 4],
                borderColor: 'rgb(74, 111, 165)',
                backgroundColor: 'rgba(74, 111, 165, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Initialize contribution types chart
    const typesCtx = document.getElementById('types-chart').getContext('2d');
    window.typesChart = new Chart(typesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Development', 'Documentation', 'Testing', 'Research', 'Maintenance'],
            datasets: [{
                data: [40, 20, 15, 15, 10],
                backgroundColor: [
                    'rgba(74, 111, 165, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(108, 117, 125, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateAgentCharts(agentId) {
    // Update the charts with agent-specific data
    if (window.weeklyChart) {
        // Generate new data based on agent
        const weeklyData = getAgentWeeklyData(agentId);
        window.weeklyChart.data.datasets[0].data = weeklyData;
        window.weeklyChart.update();
    }
    
    if (window.typesChart) {
        // Update contribution types based on agent
        const typesData = getAgentContributionTypes(agentId);
        window.typesChart.data.datasets[0].data = typesData;
        window.typesChart.update();
    }
}

function getAgentWeeklyData(agentId) {
    // Different agents have different weekly patterns
    const patterns = {
        nellie: [7, 9, 6, 8, 10, 4, 2],
        callie: [5, 6, 5, 7, 5, 2, 1],
        berry: [8, 10, 9, 11, 8, 3, 2],
        razzy: [2, 4, 3, 5, 4, 1, 0],
        richie: [4, 6, 5, 7, 6, 2, 3]
    };
    
    return patterns[agentId] || patterns.nellie;
}

function getAgentContributionTypes(agentId) {
    // Different agents focus on different types of work
    const contributions = {
        nellie: [50, 15, 10, 10, 15], // More development
        callie: [20, 10, 30, 15, 25], // More testing/monitoring
        berry: [30, 10, 20, 25, 15], // More data processing
        razzy: [25, 20, 15, 25, 15], // Balanced
        richie: [10, 60, 5, 10, 15]  // Mostly documentation
    };
    
    return contributions[agentId] || contributions.nellie;
}

function updateCollaborationDiagram(agentId) {
    // Create a collaboration diagram centered on the selected agent
    let diagram;
    
    switch(agentId) {
        case 'nellie':
            diagram = `
                graph LR
                    A[Nellie<br/>Lead] --> B[Callie<br/>Monitor]
                    A --> C[Berry<br/>Data]
                    A --> D[Razzy<br/>Support]
                    A --> E[Richie<br/>Docs]
                    B --> A
                    C --> A
                    D --> A
                    E --> A
            `;
            break;
        case 'callie':
            diagram = `
                graph LR
                    B[Callie<br/>Monitor] --> A[Nellie<br/>Lead]
                    B --> C[Berry<br/>Data]
                    B --> E[Richie<br/>Docs]
                    A --> B
                    C --> B
                    E --> B
            `;
            break;
        case 'berry':
            diagram = `
                graph LR
                    C[Berry<br/>Data] --> A[Nellie<br/>Lead]
                    C --> B[Callie<br/>Monitor]
                    C --> D[Razzy<br/>Support]
                    A --> C
                    B --> C
                    D --> C
            `;
            break;
        case 'razzy':
            diagram = `
                graph LR
                    D[Razzy<br/>Support] --> A[Nellie<br/>Lead]
                    D --> C[Berry<br/>Data]
                    D --> E[Richie<br/>Docs]
                    A --> D
                    C --> D
                    E --> D
            `;
            break;
        case 'richie':
            diagram = `
                graph LR
                    E[Richie<br/>Docs] --> A[Nellie<br/>Lead]
                    E --> B[Callie<br/>Monitor]
                    E --> D[Razzy<br/>Support]
                    A --> E
                    B --> E
                    D --> E
            `;
            break;
        default:
            diagram = `
                graph LR
                    A[Nellie<br/>Lead] --> B[Callie<br/>Monitor]
                    B --> C[Berry<br/>Data]
                    C --> D[Razzy<br/>Support]
                    D --> E[Richie<br/>Docs]
                    E --> A
            `;
    }
    
    const diagramElement = document.getElementById('agent-collaboration-diagram');
    diagramElement.innerHTML = `<pre>${diagram}</pre>`;
    
    // Render with Mermaid
    mermaid.init(undefined, diagramElement.querySelectorAll('pre'));
}

function updateAgentDetails() {
    console.log('Updating agent details...');
    updateTimeDisplay();
    
    // Get currently selected agent
    const activeTab = document.querySelector('.agent-tab.active');
    if (activeTab) {
        const agentId = activeTab.getAttribute('data-agent');
        loadAgentData(agentId);
    }
}

function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffDays >= 1) {
        return `${diffDays}d ago`;
    } else if (diffHrs >= 1) {
        return `${diffHrs}h ago`;
    } else if (diffMins >= 1) {
        return `${diffMins}m ago`;
    } else {
        return 'Just now';
    }
}