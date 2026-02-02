// Collaboration Map JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize collaboration map
    initializeCollaborationMap();
    
    // Set up filters
    setupFilters();
    
    // Set up automatic updates
    setInterval(updateCollaborationMap, 60000); // Update every minute
});

function initializeCollaborationMap() {
    // Set the current time
    updateTimeDisplay();
    
    // Initialize charts
    initializeCollaborationCharts();
    
    // Initialize Mermaid
    mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true
        }
    });
    
    // Render initial collaboration network
    renderCollaborationNetwork();
    
    // Update statistics
    updateCollaborationStats();
    
    // Update history
    updateCollaborationHistory();
}

function setupFilters() {
    // Set up time range filter
    const timeRangeSelect = document.getElementById('time-range');
    timeRangeSelect.addEventListener('change', function() {
        updateCollaborationMap();
    });
    
    // Set up interaction type filter
    const interactionFilter = document.getElementById('interaction-filter');
    interactionFilter.addEventListener('change', function() {
        updateCollaborationMap();
    });
}

function renderCollaborationNetwork() {
    // Create a dynamic collaboration network diagram
    const networkData = generateCollaborationNetwork();
    
    const diagramElement = document.getElementById('collaboration-network');
    diagramElement.innerHTML = `<pre>${networkData}</pre>`;
    
    // Render with Mermaid
    mermaid.init(undefined, diagramElement.querySelectorAll('pre'));
}

function generateCollaborationNetwork() {
    // Generate a network diagram based on collaboration intensity
    return `
        graph LR
            subgraph "AI Team"
                N[Nellie<br/>Lead<br/>↑ High Activity]
                C[Callie<br/>Monitor<br/>↑ Medium Activity] 
                B[Berry<br/>Data<br/>↑ High Activity]
                Rz[Razzy<br/>Support<br/>↑ Low Activity]
                Ri[Richie<br/>Docs<br/>↑ Medium Activity]
            end
            
            %% Collaboration Intensity (thickness represents frequency)
            N ==> C
            N ==> B
            B ==> N
            C ==> B
            N ==> Rz
            B ==> Ri
            Ri ==> N
            Rz ==> C
            C -.-> Ri
            B -.-> Rz
            
            %% Legend
            subgraph "Legend"
                L1[=== Strong Connection]
                L2[-.-> Weak Connection]
            end
    `;
}

function initializeCollaborationCharts() {
    // Initialize timeline chart
    const timelineCtx = document.getElementById('interaction-timeline-chart').getContext('2d');
    
    const hours = [];
    for (let i = 23; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i);
        hours.push(hour.getHours() + ':00');
    }
    
    window.timelineChart = new Chart(timelineCtx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Interactions per Hour',
                data: generateRandomTimelineData(),
                borderColor: 'rgb(74, 111, 165)',
                backgroundColor: 'rgba(74, 111, 165, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Interactions'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hour of Day'
                    }
                }
            }
        }
    });
}

function generateRandomTimelineData() {
    // Generate realistic collaboration data
    const data = [];
    for (let i = 0; i < 24; i++) {
        // Peak collaboration during business hours (9-17)
        let value;
        if (i >= 9 && i <= 17) {
            value = Math.floor(Math.random() * 8) + 5; // Higher activity
        } else {
            value = Math.floor(Math.random() * 5) + 1; // Lower activity
        }
        data.push(value);
    }
    return data;
}

function updateCollaborationStats() {
    // Update static stats (in a real implementation, these would come from data)
    document.getElementById('total-interactions').textContent = getRandomValue(100, 200);
    document.getElementById('peak-collaboration').textContent = getRandomPair();
    document.getElementById('collaboration-score').textContent = (Math.random() * 2 + 8).toFixed(1) + '/10';
    document.getElementById('active-connections').textContent = getRandomValue(8, 15);
}

function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPair() {
    const agents = ['Nellie ↔ Berry', 'Nellie ↔ Callie', 'Berry ↔ Callie', 'Richie ↔ Nellie', 'Razzy ↔ Berry'];
    return agents[Math.floor(Math.random() * agents.length)];
}

function updateCollaborationHistory() {
    // Generate recent collaboration history
    const historyData = generateCollaborationHistory();
    const tbody = document.getElementById('collaboration-history-body');
    
    tbody.innerHTML = '';
    
    historyData.forEach(item => {
        const row = document.createElement('tr');
        
        const timeCell = document.createElement('td');
        timeCell.textContent = item.time;
        
        const participantsCell = document.createElement('td');
        participantsCell.textContent = item.participants;
        
        const typeCell = document.createElement('td');
        typeCell.textContent = item.type;
        
        const purposeCell = document.createElement('td');
        purposeCell.textContent = item.purpose;
        
        const outcomeCell = document.createElement('td');
        const outcomeSpan = document.createElement('span');
        outcomeSpan.className = `outcome ${item.outcome.toLowerCase()}`;
        outcomeSpan.textContent = item.outcome;
        outcomeCell.appendChild(outcomeSpan);
        
        row.appendChild(timeCell);
        row.appendChild(participantsCell);
        row.appendChild(typeCell);
        row.appendChild(purposeCell);
        row.appendChild(outcomeCell);
        
        tbody.appendChild(row);
    });
}

function generateCollaborationHistory() {
    const agents = ['Nellie', 'Callie', 'Berry', 'Razzy', 'Richie'];
    const types = ['Communication', 'Code Review', 'Problem Solving', 'Task Assignment', 'Planning'];
    const purposes = [
        'Bug fix discussion',
        'Feature implementation',
        'System optimization',
        'Documentation review',
        'Architecture planning',
        'Code refactoring',
        'Testing strategy',
        'Deployment coordination'
    ];
    const outcomes = ['Success', 'Partial', 'Ongoing', 'Delayed'];
    
    const history = [];
    
    for (let i = 0; i < 10; i++) {
        // Generate random participants (1-3 agents)
        const numParticipants = Math.floor(Math.random() * 3) + 1;
        const participantsSet = new Set();
        
        while (participantsSet.size < numParticipants) {
            participantsSet.add(agents[Math.floor(Math.random() * agents.length)]);
        }
        
        const participants = Array.from(participantsSet).join(', ');
        
        history.push({
            time: generateRandomTime(i),
            participants: participants,
            type: types[Math.floor(Math.random() * types.length)],
            purpose: purposes[Math.floor(Math.random() * purposes.length)],
            outcome: outcomes[Math.floor(Math.random() * outcomes.length)]
        });
    }
    
    return history;
}

function generateRandomTime(index) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (index * 15 + Math.floor(Math.random() * 10)));
    return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function updateCollaborationMap() {
    console.log('Updating collaboration map...');
    updateTimeDisplay();
    
    // Get current filters
    const timeRange = document.getElementById('time-range').value;
    const interactionType = document.getElementById('interaction-filter').value;
    
    console.log(`Filters - Time: ${timeRange}, Type: ${interactionType}`);
    
    // Update network visualization
    renderCollaborationNetwork();
    
    // Update statistics
    updateCollaborationStats();
    
    // Update timeline chart
    if (window.timelineChart) {
        window.timelineChart.data.datasets[0].data = generateRandomTimelineData();
        window.timelineChart.update();
    }
    
    // Update history
    updateCollaborationHistory();
}

function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}

// Add event listener for the enhanced view button
document.addEventListener('DOMContentLoaded', function() {
    const enhancedViewBtn = document.getElementById('enhanced-view-btn');
    if (enhancedViewBtn) {
        enhancedViewBtn.addEventListener('click', function() {
            window.location.href = 'enhanced-collaboration-map.html';
        });
    }
});