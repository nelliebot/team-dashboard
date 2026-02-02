/**
 * Script to update collaboration data from GitHub API
 * This script analyzes interactions between team members based on issues, PRs, and comments
 */

const fs = require('fs').promises;
const { Octokit } = require('@octokit/rest');
const { throttling } = require('@octokit/plugin-throttling');

// Create Octokit instance with throttling
const MyOctokit = Octokit.plugin(throttling);

const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
      console.log(`Retrying after ${retryAfter} seconds!`);
      return true;
    },
    onAbuseLimit: (retryAfter, options) => {
      console.warn(`Abuse detected for request ${options.method} ${options.url}`);
    },
  }
});

async function updateCollaborationData() {
  console.log('Starting collaboration data update...');
  
  try {
    const owner = process.env.REPO_OWNER || 'your-username';
    const repo = process.env.REPO_NAME || 'team-dashboard';
    
    // Fetch issues and pull requests
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: 'all',
      per_page: 100
    });
    
    // Analyze collaboration patterns
    const collaborationData = analyzeCollaborationPatterns(issues);
    
    // Create collaboration data object
    const collaborationResult = {
      updatedAt: new Date().toISOString(),
      repository: {
        name: repo,
        owner: owner
      },
      collaborationNetwork: collaborationData.network,
      interactionCounts: collaborationData.counts,
      projectAssignments: collaborationData.assignments,
      activityInsights: collaborationData.insights
    };
    
    // Write collaboration data to a JSON file
    await fs.writeFile(
      'collaboration-data.json', 
      JSON.stringify(collaborationResult, null, 2)
    );
    
    console.log('Collaboration data updated successfully!');
    console.log('Collaboration network:', collaborationResult.collaborationNetwork);
    
  } catch (error) {
    console.error('Error updating collaboration data:', error);
    process.exit(1);
  }
}

function analyzeCollaborationPatterns(issues) {
  const agents = ['nellie', 'callie', 'berry', 'razzy', 'richie'];
  const counts = {};
  const assignments = {};
  const network = [];
  const insights = {};
  
  // Initialize counts
  agents.forEach(agent => {
    counts[agent] = {
      opened: 0,
      commented: 0,
      assigned: 0,
      totalInteractions: 0
    };
    
    assignments[agent] = [];
  });
  
  // Process issues to identify collaboration patterns
  issues.forEach(issue => {
    const opener = (issue.user?.login || '').toLowerCase();
    const assignee = (issue.assignee?.login || '').toLowerCase();
    
    // Count issues opened by each agent
    if (agents.includes(opener)) {
      counts[opener].opened++;
      counts[opener].totalInteractions++;
      
      // Track project assignments
      if (issue.title) {
        assignments[opener].push({
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          createdAt: issue.created_at
        });
      }
    }
    
    // Count assignments to each agent
    if (agents.includes(assignee)) {
      counts[assignee].assigned++;
      counts[assignee].totalInteractions++;
    }
    
    // Process comments to identify interactions
    if (issue.comments > 0) {
      // In a real implementation, we would fetch comments for each issue
      // For now, we'll simulate based on issue data
      for (let i = 0; i < Math.min(issue.comments, 3); i++) {
        // Simulate interactions between opener and assignee
        if (agents.includes(opener) && agents.includes(assignee) && opener !== assignee) {
          const interaction = {
            source: opener,
            target: assignee,
            type: 'discussion',
            weight: Math.min(issue.comments, 10), // Scale down large comment counts
            issue: {
              title: issue.title,
              number: issue.number,
              url: issue.html_url
            }
          };
          
          network.push(interaction);
          counts[opener].commented++;
          counts[assignee].commented++;
          counts[opener].totalInteractions++;
          counts[assignee].totalInteractions++;
        }
      }
    }
  });
  
  // Calculate insights
  insights.mostActive = Object.keys(counts).reduce((a, b) => 
    counts[a].totalInteractions > counts[b].totalInteractions ? a : b
  );
  
  insights.mostCollaborativePair = findMostCollaborativePair(network);
  
  // Ensure all agents are represented in the network
  agents.forEach(agent => {
    const agentExists = network.some(conn => conn.source === agent || conn.target === agent);
    if (!agentExists) {
      // Add a self-loop to ensure the agent appears in the graph
      network.push({
        source: agent,
        target: agent,
        type: 'independent-work',
        weight: 1,
        issue: null
      });
    }
  });
  
  return {
    counts,
    assignments,
    network,
    insights
  };
}

function findMostCollaborativePair(network) {
  const pairCounts = {};
  
  network.forEach(connection => {
    if (connection.source !== connection.target) {
      const pair = [connection.source, connection.target].sort().join('-');
      pairCounts[pair] = (pairCounts[pair] || 0) + connection.weight;
    }
  });
  
  let maxPair = null;
  let maxWeight = 0;
  
  for (const [pair, weight] of Object.entries(pairCounts)) {
    if (weight > maxWeight) {
      maxWeight = weight;
      maxPair = pair;
    }
  }
  
  return maxPair ? {
    pair: maxPair.split('-'),
    weight: maxWeight
  } : null;
}

// Run the update function
updateCollaborationData();