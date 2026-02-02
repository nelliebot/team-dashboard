// Agent Collaboration Graph JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the collaboration graph
    initializeCollaborationGraph();
    
    // Set up filters
    setupGraphFilters();
    
    // Set up automatic updates
    setInterval(updateCollaborationGraph, 30000); // Update every 30 seconds
});

function initializeCollaborationGraph() {
    // Set the current time
    updateTimeDisplay();
    
    // Initialize charts
    initializeGraphCharts();
    
    // Initialize the force-directed graph
    initializeForceDirectedGraph();
    
    // Render the collaboration graph
    renderCollaborationGraph();
    
    // Add navigation to other views
    addNavigationControls();
}

function setupGraphFilters() {
    // Set up time range filter
    document.getElementById('time-range').addEventListener('change', function() {
        updateCollaborationGraph();
    });
    
    // Set up interaction type filter
    document.getElementById('interaction-filter').addEventListener('change', function() {
        updateCollaborationGraph();
    });
    
    // Set up layout type filter
    document.getElementById('layout-type').addEventListener('change', function() {
        changeGraphLayout();
    });
}

function initializeForceDirectedGraph() {
    // Get dimensions
    const container = document.getElementById('network-graph');
    const width = container.clientWidth;
    const height = 500;
    
    // Create SVG container
    const svg = d3.select("#collaboration-force-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Store SVG reference globally for later use
    window.graphSvg = svg;
    window.graphWidth = width;
    window.graphHeight = height;
}

function renderCollaborationGraph() {
    if (!window.graphSvg) {
        initializeForceDirectedGraph();
    }
    
    const svg = window.graphSvg;
    const width = window.graphWidth;
    const height = window.graphHeight;
    
    // Clear previous elements
    svg.selectAll("*").remove();
    
    // Agent data with roles and properties
    const agents = [
        { id: "nellie", name: "Nellie", role: "Lead", activity: "high", color: "#4a6fa5", x: width * 0.5, y: height * 0.3 },
        { id: "callie", name: "Callie", role: "Monitor", activity: "medium", color: "#28a745", x: width * 0.2, y: height * 0.6 },
        { id: "berry", name: "Berry", role: "Data", activity: "high", color: "#ffc107", x: width * 0.8, y: height * 0.6 },
        { id: "razzy", name: "Razzy", role: "Support", activity: "low", color: "#17a2b8", x: width * 0.3, y: height * 0.8 },
        { id: "richie", name: "Richie", role: "Docs", activity: "medium", color: "#6f42c1", x: width * 0.7, y: height * 0.8 }
    ];
    
    // Define collaboration links with weights and types
    const links = [
        { source: "nellie", target: "callie", weight: 8, type: "communication", strength: 0.8 },
        { source: "nellie", target: "berry", weight: 9, type: "problem-solving", strength: 0.9 },
        { source: "berry", target: "nellie", weight: 7, type: "code-review", strength: 0.7 },
        { source: "callie", target: "berry", weight: 6, type: "communication", strength: 0.6 },
        { source: "nellie", target: "razzy", weight: 5, type: "task-assignment", strength: 0.5 },
        { source: "berry", target: "richie", weight: 7, type: "problem-solving", strength: 0.7 },
        { source: "richie", target: "nellie", weight: 4, type: "communication", strength: 0.4 },
        { source: "razzy", target: "callie", weight: 3, type: "communication", strength: 0.3 },
        { source: "callie", target: "richie", weight: 2, type: "planning", strength: 0.2 },
        { source: "berry", target: "razzy", weight: 4, type: "code-review", strength: 0.4 }
    ];
    
    // Apply filters
    const timeRange = document.getElementById('time-range').value;
    const interactionType = document.getElementById('interaction-filter').value;
    
    let filteredLinks = links;
    if (interactionType !== 'all') {
        filteredLinks = links.filter(link => link.type === interactionType);
    }
    
    // Create the simulation
    const simulation = d3.forceSimulation(agents)
        .force("link", d3.forceLink(filteredLinks)
            .id(d => d.id)
            .distance(d => 100 - (d.weight * 5)) // Closer for stronger connections
            .strength(d => d.strength))
        .force("charge", d3.forceManyBody()
            .strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide()
            .radius(40))
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05));
    
    // Add zoom functionality
    const g = svg.append("g");
    
    const zoom = d3.zoom()
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoom);
    
    // Add links to the graph
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(filteredLinks)
        .enter().append("line")
        .attr("stroke", d => getLinkColor(d.type))
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => d.weight * 1.2)
        .attr("stroke-dasharray", d => d.type === "task-assignment" ? "5,5" : "none");
    
    // Add link labels (interaction types)
    const linkLabel = g.append("g")
        .attr("class", "link-labels")
        .selectAll("text")
        .data(filteredLinks)
        .enter().append("text")
        .text(d => d.type)
        .attr("font-size", "10px")
        .attr("fill", "#666")
        .attr("text-anchor", "middle")
        .attr("pointer-events", "none");
    
    // Add nodes to the graph
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(agents)
        .enter().append("g")
        .call(drag(simulation));
    
    // Add circles for nodes
    node.append("circle")
        .attr("r", d => d.activity === "high" ? 25 : d.activity === "medium" ? 20 : 15)
        .attr("fill", d => d.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("class", "agent-node");
    
    // Add agent names
    node.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(d => d.name.substring(0, 3)); // Abbreviated name
    
    // Add role labels
    node.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "9px")
        .text(d => d.role);
    
    // Add tooltips
    node.append("title")
        .text(d => `${d.name}\nRole: ${d.role}\nActivity: ${d.activity}\nConnections: ${getAgentConnectionCount(d.id, filteredLinks)}\nProjects: ${getAgentProjects(d.name)}`);
    
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
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
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
    
    // Store simulation for later use
    window.graphSimulation = simulation;
}

function getLinkColor(interactionType) {
    switch(interactionType) {
        case "communication":
            return "#4a6fa5"; // Blue
        case "problem-solving":
            return "#28a745"; // Green
        case "code-review":
            return "#ffc107"; // Yellow
        case "task-assignment":
            return "#dc3545"; // Red
        case "planning":
            return "#17a2b8"; // Teal
        default:
            return "#6c757d"; // Gray
    }
}

function getAgentConnectionCount(agentId, links) {
    return links.filter(link => link.source.id === agentId || link.target.id === agentId).length;
}

function getAgentProjects(agentName) {
    const projects = {
        "Nellie": 3,
        "Callie": 2,
        "Berry": 3,
        "Razzy": 2,
        "Richie": 2
    };
    return projects[agentName] || 1;
}

function changeGraphLayout() {
    const layoutType = document.getElementById('layout-type').value;
    
    // For now, just re-render the same force-directed graph
    // In a full implementation, we could switch to different layouts
    renderCollaborationGraph();
}

function initializeGraphCharts() {
    // Initialize communication frequency chart
    const freqCtx = document.getElementById('communication-frequency-chart').getContext('2d');
    
    window.freqChart = new Chart(freqCtx, {
        type: 'bar',
        data: {
            labels: ['Nellie', 'Callie', 'Berry', 'Razzy', 'Richie'],
            datasets: [{
                label: 'Communication Events',
                data: [45, 32, 52, 18, 28],
                backgroundColor: [
                    '#4a6fa5',
                    '#28a745',
                    '#ffc107',
                    '#17a2b8',
                    '#6f42c1'
                ],
                borderWidth: 1
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
    
    // Initialize collaboration types chart
    const typesCtx = document.getElementById('collaboration-types-chart').getContext('2d');
    
    window.typesChart = new Chart(typesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Communication', 'Problem Solving', 'Code Review', 'Task Assignment', 'Planning'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    '#4a6fa5',
                    '#28a745',
                    '#ffc107',
                    '#dc3545',
                    '#17a2b8'
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

function updateCollaborationGraph() {
    console.log('Updating collaboration graph...');
    updateTimeDisplay();
    
    // Re-render the graph with current filters
    renderCollaborationGraph();
    
    // Update charts
    if (window.freqChart) {
        // Update with new random data for demo purposes
        window.freqChart.data.datasets[0].data = [
            Math.floor(Math.random() * 20) + 35,
            Math.floor(Math.random() * 20) + 25,
            Math.floor(Math.random() * 20) + 40,
            Math.floor(Math.random() * 15) + 15,
            Math.floor(Math.random() * 15) + 20
        ];
        window.freqChart.update();
    }
    
    if (window.typesChart) {
        // Update with new random data for demo purposes
        const total = 100;
        const data = [];
        let remaining = total;
        
        for (let i = 0; i < 4; i++) {
            const value = Math.floor(Math.random() * 20) + 15;
            data.push(value);
            remaining -= value;
        }
        data.push(remaining < 0 ? 0 : remaining);
        
        window.typesChart.data.datasets[0].data = data;
        window.typesChart.update();
    }
}

function addNavigationControls() {
    // Add a button to go back to the main dashboard
    const controlsDiv = document.querySelector('.controls');
    
    const backButton = document.createElement('button');
    backButton.className = 'btn-secondary';
    backButton.textContent = 'Back to Dashboard';
    backButton.style.marginTop = '15px';
    backButton.style.display = 'inline-block';
    backButton.onclick = () => window.location.href = 'index.html';
    
    controlsDiv.appendChild(backButton);
    
    // Add a button to switch to enhanced view
    const enhancedButton = document.createElement('button');
    enhancedButton.className = 'btn-secondary';
    enhancedButton.textContent = 'Enhanced View';
    enhancedButton.style.marginTop = '15px';
    enhancedButton.style.marginLeft = '10px';
    enhancedButton.onclick = () => window.location.href = 'enhanced-collaboration-map.html';
    
    controlsDiv.appendChild(enhancedButton);
}

function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}

// Handle window resize to adjust graph size
window.addEventListener('resize', function() {
    if (window.graphSvg) {
        // Reinitialize the graph with new dimensions
        setTimeout(renderCollaborationGraph, 100);
    }
});