# Team Dashboard

A comprehensive dashboard for monitoring AI agent team collaboration, providing real-time visibility into what the team of AI agents (Nellie, Callie, Berry, Razzy, Richie) is working on and how they're collaborating.

## Features

### Core Features
- **Real-time Status Indicators**: Colored indicators showing each agent's current status
- **Agent Detail Views**: Detailed information about each agent's activities and responsibilities
- **Collaboration Mapping**: Visual representation of how agents interact and collaborate
- **Enhanced Collaboration Graph**: Interactive force-directed graph showing relationships between agents
- **Project Tracking**: Visibility into current projects and agent assignments
- **Activity Feed**: Chronological log of agent activities and interactions
- **Progress Tracking**: Visual indicators of project completion and milestones

### Visualization Components
1. **Agent Status Cards**: Shows individual agent status, current tasks, and activity levels
2. **Collaboration Network**: Interactive graph showing relationships between agents
3. **Project Workload**: Distribution of work across agents and projects
4. **Interaction Timeline**: Temporal view of collaboration patterns
5. **Statistics Dashboard**: Key metrics about team performance and collaboration

## Dashboard Pages

- **Overview** (`index.html`): Main dashboard with agent statuses and key metrics
- **Agent Details** (`agent-details.html`): Detailed view of individual agent activities
- **Collaboration Map** (`collaboration-map.html`): Mermaid-based collaboration visualization
- **Collaboration Graph** (`agent-collaboration-graph.html`): Interactive D3.js force-directed graph
- **Enhanced Collaboration** (`enhanced-collaboration-map.html`): Advanced collaboration analytics
- **Progress Tracking** (`progress-tracking.html`): Project progress and milestone tracking

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: D3.js for interactive graphs, Chart.js for statistical charts, Mermaid for diagram rendering
- **API Integration**: GitHub REST API for real-time data
- **Styling**: Custom CSS with responsive design

## Installation & Usage

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser, or use a local server:
   ```bash
   cd team-dashboard
   npx http-server
   ```
3. Navigate to the provided URL (typically http://127.0.0.1:8080)

### GitHub Pages Deployment
The dashboard is designed to work with GitHub Pages. Simply enable GitHub Pages in your repository settings pointing to the root directory.

## Configuration

### GitHub Integration
To enable GitHub API integration:
1. Generate a GitHub Personal Access Token with appropriate permissions
2. Save the token using the dashboard's token management interface
3. The dashboard will automatically fetch and display repository data

## Data Sources

The dashboard pulls data from:
- GitHub API (for repository, issue, and PR data)
- Local configuration files
- Simulated data for demonstration purposes

## Customization

The dashboard is highly customizable:
- Add new agents by updating the agent configuration
- Modify visualization components to suit your needs
- Extend the data model to include additional metrics
- Customize styling through the CSS files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.