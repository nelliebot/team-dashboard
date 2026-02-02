// Progress Tracking JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress tracking
    initializeProgressTracking();
    
    // Set up filters
    setupProgressFilters();
    
    // Set up sprint navigation
    setupSprintNavigation();
    
    // Set up automatic updates
    setInterval(updateProgressTracking, 45000); // Update every 45 seconds
});

function initializeProgressTracking() {
    // Set the current time
    updateTimeDisplay();
    
    // Initialize charts
    initializeProgressCharts();
    
    // Update overview stats
    updateOverviewStats();
    
    // Update task board
    updateTaskBoard();
}

function initializeProgressCharts() {
    // Initialize agent progress chart
    const agentProgressCtx = document.getElementById('agent-progress-chart').getContext('2d');
    window.agentProgressChart = new Chart(agentProgressCtx, {
        type: 'bar',
        data: {
            labels: ['Nellie', 'Callie', 'Berry', 'Razzy', 'Richie'],
            datasets: [{
                label: 'Completion %',
                data: [85, 65, 90, 45, 75],
                backgroundColor: [
                    'rgba(74, 111, 165, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(23, 162, 184, 0.7)'
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Completion Percentage'
                    }
                }
            }
        }
    });
    
    // Initialize work distribution chart
    const workDistributionCtx = document.getElementById('work-distribution-chart').getContext('2d');
    window.workDistributionChart = new Chart(workDistributionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Development', 'Documentation', 'Testing', 'Research', 'Maintenance'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
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
    
    // Initialize sprint burndown chart
    const burndownCtx = document.getElementById('sprint-burndown-chart').getContext('2d');
    const daysInSprint = 14; // 2 weeks
    const days = Array.from({length: daysInSprint}, (_, i) => `Day ${i+1}`);
    
    window.burndownChart = new Chart(burndownCtx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Ideal Burndown',
                    data: generateIdealBurndown(42, daysInSprint),
                    borderColor: 'rgba(108, 117, 125, 0.8)',
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Actual Burndown',
                    data: generateActualBurndown(42, daysInSprint),
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Story Points Remaining'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Sprint Days'
                    }
                }
            }
        }
    });
}

function generateIdealBurndown(totalPoints, days) {
    const result = [];
    const decrement = totalPoints / days;
    
    for (let i = 0; i <= days; i++) {
        result.push(Math.max(0, totalPoints - (i * decrement)));
    }
    
    return result;
}

function generateActualBurndown(totalPoints, days) {
    const result = [];
    let remaining = totalPoints;
    const dayDecrement = totalPoints / days;
    
    for (let i = 0; i <= days; i++) {
        // Simulate some variation in actual progress
        if (i === 0) {
            result.push(totalPoints);
        } else {
            // Random variation around the ideal pace
            const variation = (Math.random() - 0.3) * dayDecrement * 2;
            remaining = Math.max(0, remaining - dayDecrement - variation);
            result.push(remaining);
        }
    }
    
    return result;
}

function updateOverviewStats() {
    // Update overview statistics
    document.getElementById('overall-progress').textContent = 
        (Math.random() * 10 + 75).toFixed(0) + '%';
    
    document.getElementById('project-completion').textContent = 
        (Math.random() * 10 + 60).toFixed(0) + '%';
    
    document.getElementById('velocity').textContent = 
        (Math.random() * 2 + 7).toFixed(1);
    
    document.getElementById('efficiency').textContent = 
        (Math.random() * 8 + 88).toFixed(0) + '%';
}

function setupProgressFilters() {
    // Set up task status filter
    document.getElementById('task-status-filter').addEventListener('change', function() {
        updateTaskBoard();
    });
    
    // Set up task priority filter
    document.getElementById('task-priority-filter').addEventListener('change', function() {
        updateTaskBoard();
    });
    
    // Set up task agent filter
    document.getElementById('task-agent-filter').addEventListener('change', function() {
        updateTaskBoard();
    });
}

function setupSprintNavigation() {
    // Set up sprint navigation buttons
    document.getElementById('prev-sprint').addEventListener('click', function() {
        console.log('Previous sprint clicked');
        updateSprintInfo(-1);
    });
    
    document.getElementById('next-sprint').addEventListener('click', function() {
        console.log('Next sprint clicked');
        updateSprintInfo(1);
    });
}

function updateSprintInfo(direction) {
    // Update sprint information based on direction
    const sprintLabel = document.getElementById('current-sprint');
    const currentText = sprintLabel.textContent;
    
    // Extract current sprint number
    const match = currentText.match(/Sprint (\d+)/);
    if (match) {
        const currentSprint = parseInt(match[1]);
        const newSprint = currentSprint + direction;
        
        // Calculate new dates (simplified)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (direction * 14)); // Move by 2 weeks
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 13); // 14 days later
        
        sprintLabel.textContent = `Sprint ${newSprint}: ${formatDate(startDate)} - ${formatDate(endDate)}`;
        
        // Update sprint stats
        updateSprintStats();
    }
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateSprintStats() {
    // Update sprint statistics with random values for simulation
    document.getElementById('sprint-goal').textContent = getRandomValue(35, 50);
    document.getElementById('completed-points').textContent = getRandomValue(25, 40);
    document.getElementById('remaining-points').textContent = getRandomValue(5, 15);
    document.getElementById('sprint-burndown').textContent = 
        (Math.random() * 15 + 80).toFixed(0) + '%';
    
    // Update burndown chart
    if (window.burndownChart) {
        const totalPoints = parseInt(document.getElementById('sprint-goal').textContent);
        const daysInSprint = 14;
        
        window.burndownChart.data.datasets[0].data = generateIdealBurndown(totalPoints, daysInSprint);
        window.burndownChart.data.datasets[1].data = generateActualBurndown(totalPoints, daysInSprint);
        window.burndownChart.update();
    }
}

function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateTaskBoard() {
    // Clear all task lists
    const columns = ['todo', 'in-progress', 'review', 'done'];
    columns.forEach(status => {
        const list = document.getElementById(`${status}-tasks`);
        list.innerHTML = '';
    });
    
    // Generate tasks based on filters
    const statusFilter = document.getElementById('task-status-filter').value;
    const priorityFilter = document.getElementById('task-priority-filter').value;
    const agentFilter = document.getElementById('task-agent-filter').value;
    
    // Generate sample tasks
    const tasks = generateSampleTasks();
    
    // Apply filters
    const filteredTasks = tasks.filter(task => {
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        if (agentFilter !== 'all' && task.assignee !== agentFilter) return false;
        return true;
    });
    
    // Distribute tasks to appropriate columns
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
    });
    
    // Update task counts
    updateTaskCounts(tasks);
}

function generateSampleTasks() {
    const agents = ['nellie', 'callie', 'berry', 'razzy', 'richie'];
    const statuses = ['todo', 'in-progress', 'review', 'done'];
    const priorities = ['critical', 'high', 'medium', 'low'];
    
    const tasks = [];
    
    // Generate 20 sample tasks
    for (let i = 1; i <= 20; i++) {
        tasks.push({
            id: i,
            title: `Task ${i}: ${getRandomTaskTitle()}`,
            description: getRandomTaskDescription(),
            assignee: agents[Math.floor(Math.random() * agents.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            storyPoints: Math.floor(Math.random() * 8) + 1,
            dueDate: getRandomDueDate()
        });
    }
    
    return tasks;
}

function getRandomTaskTitle() {
    const titles = [
        'Implement new feature',
        'Fix critical bug',
        'Update documentation',
        'Refactor legacy code',
        'Optimize database queries',
        'Add unit tests',
        'Improve UI components',
        'Enhance security measures',
        'Performance optimization',
        'API integration work',
        'Code review tasks',
        'System maintenance',
        'Bug triage',
        'Feature enhancement',
        'Technical debt reduction'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomTaskDescription() {
    const descriptions = [
        'Implement the requested feature with proper error handling',
        'Resolve the reported issue affecting user experience',
        'Update documentation to reflect recent changes',
        'Clean up legacy code to improve maintainability',
        'Optimize slow-performing database queries',
        'Add comprehensive test coverage for new functionality',
        'Modernize UI components for better user experience',
        'Implement additional security measures',
        'Optimize application performance',
        'Integrate with external API services',
        'Perform thorough code reviews',
        'Perform routine system maintenance',
        'Triage and prioritize reported bugs',
        'Enhance existing features based on feedback',
        'Address technical debt items'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 14)); // Within next 2 weeks
    return date.toLocaleDateString();
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-card priority-${task.priority}`;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'task-title';
    titleDiv.textContent = task.title;
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';
    
    const assigneeSpan = document.createElement('span');
    assigneeSpan.className = 'task-assignee';
    assigneeSpan.textContent = getAgentName(task.assignee);
    
    const pointsSpan = document.createElement('span');
    pointsSpan.className = 'task-points';
    pointsSpan.textContent = `${task.storyPoints} pts`;
    
    const prioritySpan = document.createElement('span');
    prioritySpan.className = `task-priority priority-${task.priority}`;
    prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    
    metaDiv.appendChild(assigneeSpan);
    metaDiv.appendChild(pointsSpan);
    metaDiv.appendChild(prioritySpan);
    
    taskDiv.appendChild(titleDiv);
    taskDiv.appendChild(metaDiv);
    
    return taskDiv;
}

function getAgentName(agentId) {
    const agentNames = {
        'nellie': 'Nellie',
        'callie': 'Callie',
        'berry': 'Berry',
        'razzy': 'Razzy',
        'richie': 'Richie'
    };
    
    return agentNames[agentId] || agentId;
}

function updateTaskCounts(allTasks) {
    const counts = {
        'todo': 0,
        'in-progress': 0,
        'review': 0,
        'done': 0
    };
    
    allTasks.forEach(task => {
        counts[task.status]++;
    });
    
    // Update the counts in the UI
    document.querySelector('#todo-tasks ~ .task-count').textContent = `(${counts.todo})`;
    document.querySelector('#in-progress-tasks ~ .task-count').textContent = `(${counts['in-progress']})`;
    document.querySelector('#review-tasks ~ .task-count').textContent = `(${counts.review})`;
    document.querySelector('#done-tasks ~ .task-count').textContent = `(${counts.done})`;
}

function updateProgressTracking() {
    console.log('Updating progress tracking...');
    updateTimeDisplay();
    
    // Update overview stats
    updateOverviewStats();
    
    // Update sprint stats
    updateSprintStats();
    
    // Update charts with new data
    if (window.agentProgressChart) {
        window.agentProgressChart.data.datasets[0].data = [
            getRandomValue(70, 95),
            getRandomValue(50, 80),
            getRandomValue(75, 98),
            getRandomValue(30, 60),
            getRandomValue(60, 85)
        ];
        window.agentProgressChart.update();
    }
    
    if (window.workDistributionChart) {
        window.workDistributionChart.data.datasets[0].data = [
            getRandomValue(30, 40),
            getRandomValue(20, 30),
            getRandomValue(15, 25),
            getRandomValue(10, 20),
            getRandomValue(5, 10)
        ];
        window.workDistributionChart.update();
    }
    
    // Update task board
    updateTaskBoard();
}

function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}