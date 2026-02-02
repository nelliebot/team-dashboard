// Enhanced Collaboration Map JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced collaboration map
    initializeEnhancedCollaborationMap();
    
    // Set up filters
    setupEnhancedFilters();
    
    // Set up automatic updates
    setInterval(updateEnhancedCollaborationMap, 30000); // Update every 30 seconds
    
    // Set up view mode change listener
    document.getElementById('view-mode').addEventListener('change', function() {
        updateViewMode();
    });
    
    // Add back to regular collaboration map button if it exists
    const backToRegularBtn = document.createElement('button');
    backToRegularBtn.id = 'regular-view-btn';
    backToRegularBtn.className = 'btn-secondary';
    backToRegularBtn.textContent = 'Switch to Regular View';
    backToRegularBtn.style.marginTop = '15px';
    backToRegularBtn.style.display = 'block';
    backToRegularBtn.style.marginLeft = 'auto';
    
    backToRegularBtn.addEventListener('click', function() {
        window.location.href = 'collaboration-map.html';
    });
    
    // Add the button to the header controls
    const controlsDiv = document.querySelector('.controls');
    if (controlsDiv) {
        controlsDiv.appendChild(backToRegularBtn);
    }
});

function initializeEnhancedCollaborationMap() {
    // Set the current time
    updateTimeDisplay();
    
    // Initialize charts
    initializeEnhancedCharts();
    
    // Initialize force-directed graph
    initializeForceDirectedGraph();
    
    // Render initial collaboration network
    renderEnhancedCollaborationNetwork();
    
    // Update statistics
    updateEnhancedCollaborationStats();
    
    // Update history
    updateEnhancedCollaborationHistory();
    
    // Update project workload
    updateProjectWorkload();
}

function setupEnhancedFilters() {
    // Set up time range filter
    const timeRangeSelect = document.getElementById('time-range');
    timeRangeSelect.addEventListener('change', function() {
        updateEnhancedCollaborationMap();
    });
    
    // Set up interaction type filter
    const interactionFilter = document.getElementById('interaction-filter');
    interactionFilter.addEventListener('change', function() {
        updateEnhancedCollaborationMap();
    });
    
    // Set up view mode filter
    const viewModeSelect = document.getElementById('view-mode');
    viewModeSelect.addEventListener('change', function() {
        updateViewMode();
    });
}

function initializeForceDirectedGraph() {
    // Create a force-directed graph using D3
    const width = document.getElementById('network-graph').clientWidth;
    const height = 500;
    
    const svg = d3.select("#force-directed-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Define arrow markers for directed edges
    svg.append("defs").selectAll("marker")
        .data(["arrow"])
        .enter().append("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class", "arrow-head");
    
    // Store the SVG in the window object for later use
    window.forceGraphSvg = svg;
    window.forceGraphWidth = width;
    window.forceGraphHeight = height;
}

function updateViewMode() {
    const viewMode = document.getElementById('view-mode').value;
    const graphContainer = document.getElementById('network-graph');
    
    // Clear the existing graph
    d3.select("#force-directed-graph").html("");
    
    // Render the appropriate visualization based on the selected mode
    switch(viewMode) {
        case 'network':
            initializeForceDirectedGraph();
            renderEnhancedCollaborationNetwork();
            break;
        case 'matrix':
            renderMatrixView();
            break;
        case 'radar':
            renderRadarChart();
            break;
    }
}

async function renderEnhancedCollaborationNetwork() {
    const svg = window.forceGraphSvg;
    const width = window.forceGraphWidth;
    const height = window.forceGraphHeight;
    
    // Get current filter values
    const timeRange = document.getElementById('time-range').value;
    const interactionType = document.getElementById('interaction-filter').value;
    
    // Load real collaboration data
    let collaborationData;
    try {
        collaborationData = await window.TeamDashboard.loadCollaborationData();
    } catch (error) {
        console.warn('Failed to load collaboration data, using default:', error);
        collaborationData = getDefaultCollaborationData();
    }
    
    // Extract agents from collaboration data
    const agentsList = Object.keys(collaborationData.interactionCounts);
    const agents = agentsList.map((agent, index) => {
        const count = collaborationData.interactionCounts[agent];
        const activity = count.totalInteractions > 30 ? 'high' : count.totalInteractions > 15 ? 'medium' : 'low';
        
        // Position agents in a circular pattern
        const angle = (index / agentsList.length) * 2 * Math.PI;
        return {
            id: agent,
            name: agent.charAt(0).toUpperCase() + agent.slice(1),
            role: getAgentRole(agent),
            activity: activity,
            x: width * 0.5 + Math.cos(angle) * (width * 0.3),
            y: height * 0.5 + Math.sin(angle) * (height * 0.3)
        };
    });
    
    // Filter collaboration links based on interaction type
    let filteredLinks = collaborationData.collaborationNetwork;
    if (interactionType !== 'all') {
        filteredLinks = collaborationData.collaborationNetwork.filter(link => 
            link.type === interactionType
        );
    }
    
    // Clear previous elements
    svg.selectAll("*").remove();
    
    // Define arrow markers for directed edges
    svg.append("defs").selectAll("marker")
        .data(["arrow"])
        .enter().append("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class", "arrow-head");
    
    // Add zoom functionality
    const g = svg.append("g");
    
    const zoom = d3.zoom()
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoom);
    
    // Create the simulation
    const simulation = d3.forceSimulation(agents)
        .force("link", d3.forceLink(filteredLinks).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(50));
    
    // Add links to the graph
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(filteredLinks)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => d.weight * 1.5)
        .attr("marker-end", "url(#arrow)");
    
    // Add link labels (interaction types)
    const linkLabel = g.append("g")
        .attr("class", "link-labels")
        .selectAll("text")
        .data(filteredLinks)
        .enter().append("text")
        .text(d => d.type)
        .attr("font-size", "10px")
        .attr("fill", "#666")
        .attr("text-anchor", "middle");
    
    // Add nodes to the graph
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(agents)
        .enter().append("circle")
        .attr("r", d => d.activity === "high" ? 20 : d.activity === "medium" ? 16 : 12)
        .attr("fill", d => {
            switch(d.role) {
                case "Lead": return "#4a6fa5";
                case "Monitor": return "#28a745";
                case "Data": return "#ffc107";
                case "Support": return "#17a2b8";
                case "Docs": return "#6f42c1";
                default: return "#6c757d";
            }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .call(drag(simulation));
    
    // Add node labels
    const nodeLabel = g.append("g")
        .attr("class", "node-labels")
        .selectAll("text")
        .data(agents)
        .enter().append("text")
        .text(d => d.name)
        .attr("font-size", "12px")
        .attr("dx", 12)
        .attr("dy", 4)
        .attr("fill", "#333");
    
    // Update positions on each tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        linkLabel
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
        nodeLabel
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
    
    // Add tooltip functionality
    node.append("title")
        .text(d => `${d.name}\nRole: ${d.role}\nActivity: ${d.activity}`);
    
    // Drag functions
    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}

function renderMatrixView() {
    const svg = window.forceGraphSvg;
    const width = window.forceGraphWidth;
    const height = window.forceGraphHeight;
    
    // Clear previous elements
    svg.selectAll("*").remove();
    
    // Sample agent data
    const agents = [
        { id: "nellie", name: "Nellie", role: "Lead" },
        { id: "callie", name: "Callie", role: "Monitor" },
        { id: "berry", name: "Berry", role: "Data" },
        { id: "razzy", name: "Razzy", role: "Support" },
        { id: "richie", name: "Richie", role: "Docs" }
    ];
    
    // Create matrix visualization
    const cellSize = Math.min(width, height) / (agents.length + 1);
    const margin = 50;
    
    // Create axis labels
    agents.forEach((agent, i) => {
        // Row labels (y-axis)
        svg.append("text")
            .attr("x", margin - 10)
            .attr("y", margin + i * cellSize + cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "12px")
            .text(agent.name);
        
        // Column labels (x-axis)
        svg.append("text")
            .attr("x", margin + i * cellSize + cellSize / 2)
            .attr("y", margin - 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .attr("font-size", "12px")
            .text(agent.name);
    });
    
    // Create matrix cells
    agents.forEach((rowAgent, i) => {
        agents.forEach((colAgent, j) => {
            // Create cell
            svg.append("rect")
                .attr("x", margin + j * cellSize)
                .attr("y", margin + i * cellSize)
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("fill", i === j ? "#e9ecef" : "#f8f9fa") // Gray out diagonal
                .attr("stroke", "#dee2e6")
                .attr("stroke-width", 1);
            
            // Add interaction strength indicator (random for demo)
            if (i !== j) {
                const strength = Math.floor(Math.random() * 10) + 1;
                svg.append("circle")
                    .attr("cx", margin + j * cellSize + cellSize / 2)
                    .attr("cy", margin + i * cellSize + cellSize / 2)
                    .attr("r", strength * 1.5)
                    .attr("fill", strength > 7 ? "#28a745" : strength > 4 ? "#ffc107" : "#dc3545");
            }
        });
    });
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Collaboration Matrix - Interaction Strength");
}

function renderRadarChart() {
    const svg = window.forceGraphSvg;
    const width = window.forceGraphWidth;
    const height = window.forceGraphHeight;
    
    // Clear previous elements
    svg.selectAll("*").remove();
    
    // Sample data for radar chart
    const agents = ["Nellie", "Callie", "Berry", "Razzy", "Richie"];
    const metrics = ["Communication", "Problem Solving", "Code Review", "Task Assignment", "Planning"];
    
    // Generate sample data
    const data = agents.map(agent => {
        return {
            agent: agent,
            values: metrics.map(() => Math.random() * 100)
        };
    });
    
    // Radar chart parameters
    const radius = Math.min(width, height) * 0.4;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw axes
    const angleSlice = (Math.PI * 2) / metrics.length;
    
    // Draw the circular grid
    for (let level = 0; level < 5; level++) {
        const r = radius * ((level + 1) / 5);
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", r)
            .attr("fill", "none")
            .attr("stroke", "#e9ecef")
            .attr("stroke-width", 1);
    }
    
    // Draw the metric axes
    metrics.forEach((metric, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x1 = centerX;
        const y1 = centerY;
        const x2 = centerX + radius * Math.cos(angle);
        const y2 = centerY + radius * Math.sin(angle);
        
        // Draw axis line
        svg.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#e9ecef")
            .attr("stroke-width", 1);
        
        // Add metric label
        svg.append("text")
            .attr("x", centerX + (radius + 20) * Math.cos(angle))
            .attr("y", centerY + (radius + 20) * Math.sin(angle))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "12px")
            .text(metric);
    });
    
    // Draw data polygons
    data.forEach((agentData, agentIndex) => {
        const color = d3.interpolateRainbow(agentIndex / agents.length);
        
        // Calculate points for the polygon
        const points = agentData.values.map((value, idx) => {
            const angle = angleSlice * idx - Math.PI / 2;
            const r = (value / 100) * radius;
            return [
                centerX + r * Math.cos(angle),
                centerY + r * Math.sin(angle)
            ];
        });
        
        // Create polygon
        const pathData = points.map((point, i) => 
            `${i === 0 ? 'M' : 'L'}${point[0]},${point[1]}`
        ).join(' ') + ' Z';
        
        svg.append("path")
            .attr("d", pathData)
            .attr("fill", color)
            .attr("fill-opacity", 0.2)
            .attr("stroke", color)
            .attr("stroke-width", 2);
        
        // Add dots for each metric
        points.forEach(point => {
            svg.append("circle")
                .attr("cx", point[0])
                .attr("cy", point[1])
                .attr("r", 4)
                .attr("fill", color);
        });
    });
    
    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 30)`);
    
    agents.forEach((agent, i) => {
        const color = d3.interpolateRainbow(i / agents.length);
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color);
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .attr("font-size", "12px")
            .text(agent);
    });
}

function initializeEnhancedCharts() {
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

function updateEnhancedCollaborationStats() {
    // Update static stats (in a real implementation, these would come from data)
    document.getElementById('total-interactions').textContent = getRandomValue(100, 200);
    document.getElementById('peak-collaboration').textContent = getRandomPair();
    document.getElementById('collaboration-score').textContent = (Math.random() * 2 + 8).toFixed(1) + '/10';
    document.getElementById('active-connections').textContent = getRandomValue(8, 15);
    document.getElementById('current-collaborators').textContent = getRandomValue(4, 5);
    document.getElementById('avg-response-time').textContent = (Math.random() * 5 + 1).toFixed(1) + ' min';
}

function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPair() {
    const agents = ['Nellie ↔ Berry', 'Nellie ↔ Callie', 'Berry ↔ Callie', 'Richie ↔ Nellie', 'Razzy ↔ Berry'];
    return agents[Math.floor(Math.random() * agents.length)];
}

function updateEnhancedCollaborationHistory() {
    // Generate recent collaboration history
    const historyData = generateEnhancedCollaborationHistory();
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
        
        const durationCell = document.createElement('td');
        durationCell.textContent = item.duration;
        
        row.appendChild(timeCell);
        row.appendChild(participantsCell);
        row.appendChild(typeCell);
        row.appendChild(purposeCell);
        row.appendChild(outcomeCell);
        row.appendChild(durationCell);
        
        tbody.appendChild(row);
    });
}

function generateEnhancedCollaborationHistory() {
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
    
    for (let i = 0; i < 15; i++) {
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
            outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
            duration: Math.floor(Math.random() * 60) + 5 + ' min' // 5-65 minutes
        });
    }
    
    return history;
}

function generateRandomTime(index) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (index * 10 + Math.floor(Math.random() * 5)));
    return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function updateProjectWorkload() {
    // Initialize project distribution chart
    const projectCtx = document.getElementById('project-distribution-chart').getContext('2d');
    const workloadCtx = document.getElementById('workload-by-agent-chart').getContext('2d');
    
    // Sample project data
    const projects = ['Link Project', 'Team Dashboard', 'System Optimization', 'Documentation', 'Monitoring'];
    const projectValues = projects.map(() => Math.floor(Math.random() * 100) + 20);
    
    // Create project distribution chart
    if (window.projectDistributionChart) {
        window.projectDistributionChart.destroy();
    }
    
    window.projectDistributionChart = new Chart(projectCtx, {
        type: 'doughnut',
        data: {
            labels: projects,
            datasets: [{
                data: projectValues,
                backgroundColor: [
                    'rgba(74, 111, 165, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(23, 162, 184, 0.7)'
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
    
    // Sample workload by agent data
    const agents = ['Nellie', 'Callie', 'Berry', 'Razzy', 'Richie'];
    const workloadValues = agents.map(() => Math.floor(Math.random() * 100));
    
    // Create workload by agent chart
    if (window.workloadByAgentChart) {
        window.workloadByAgentChart.destroy();
    }
    
    window.workloadByAgentChart = new Chart(workloadCtx, {
        type: 'bar',
        data: {
            labels: agents,
            datasets: [{
                label: 'Workload (%)',
                data: workloadValues,
                backgroundColor: [
                    'rgba(74, 111, 165, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(23, 162, 184, 0.7)'
                ]
            }]
        },
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
    });
    
    // Update project assignments list
    const assignmentsList = document.getElementById('project-assignments-list');
    assignmentsList.innerHTML = '';
    
    // Generate sample assignments
    const assignments = [
        { project: 'Link Project', agents: ['Nellie', 'Berry'], progress: 75 },
        { project: 'Team Dashboard', agents: ['Callie', 'Richie'], progress: 60 },
        { project: 'System Optimization', agents: ['Berry', 'Razzy'], progress: 30 },
        { project: 'Documentation', agents: ['Richie'], progress: 90 },
        { project: 'Monitoring', agents: ['Callie', 'Nellie'], progress: 45 }
    ];
    
    assignments.forEach(assignment => {
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'assignment-item';
        assignmentDiv.innerHTML = `
            <div class="assignment-header">
                <strong>${assignment.project}</strong>
                <span class="assignment-agents">${assignment.agents.join(', ')}</span>
            </div>
            <div class="assignment-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assignment.progress}%"></div>
                </div>
                <span class="progress-text">${assignment.progress}%</span>
            </div>
        `;
        assignmentsList.appendChild(assignmentDiv);
    });
}

function updateEnhancedCollaborationMap() {
    console.log('Updating enhanced collaboration map...');
    updateTimeDisplay();
    
    // Get current filters
    const timeRange = document.getElementById('time-range').value;
    const interactionType = document.getElementById('interaction-filter').value;
    
    console.log(`Filters - Time: ${timeRange}, Type: ${interactionType}`);
    
    // Update network visualization based on current view mode
    const viewMode = document.getElementById('view-mode').value;
    switch(viewMode) {
        case 'network':
            renderEnhancedCollaborationNetwork();
            break;
        case 'matrix':
            renderMatrixView();
            break;
        case 'radar':
            renderRadarChart();
            break;
    }
    
    // Update statistics
    updateEnhancedCollaborationStats();
    
    // Update timeline chart
    if (window.timelineChart) {
        window.timelineChart.data.datasets[0].data = generateRandomTimelineData();
        window.timelineChart.update();
    }
    
    // Update history
    updateEnhancedCollaborationHistory();
    
    // Update project workload
    updateProjectWorkload();
}

function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}
function getAgentRole(agentName) {
    const roles = {
        'nellie': 'Lead',
        'callie': 'Monitor', 
        'berry': 'Data',
        'razzy': 'Support',
        'richie': 'Docs'
    };
    return roles[agentName] || 'Member';
}

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
        }
    };
}
