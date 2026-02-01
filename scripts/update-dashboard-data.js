/**
 * Script to update dashboard data from GitHub API
 * This script would be run by GitHub Actions to fetch latest data
 */

const fs = require('fs').promises;
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function updateDashboardData() {
  console.log('Starting dashboard data update...');
  
  try {
    const owner = process.env.REPO_OWNER || 'your-username';
    const repo = process.env.REPO_NAME || 'team-dashboard';
    
    // Fetch repository data
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo
    });
    
    // Fetch recent activity (issues, PRs, commits)
    const issues = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      sort: 'updated',
      direction: 'desc',
      per_page: 10
    });
    
    // Fetch recent commits
    const commits = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 10
    });
    
    // Create dashboard data object
    const dashboardData = {
      updatedAt: new Date().toISOString(),
      repository: {
        name: repoData.name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count
      },
      recentIssues: issues.data.map(issue => ({
        id: issue.id,
        title: issue.title,
        state: issue.state,
        author: issue.user.login,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels.map(label => label.name)
      })),
      recentCommits: commits.data.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0], // First line of commit message
        author: commit.commit.author.name,
        date: commit.commit.author.date
      }))
    };
    
    // Write data to a JSON file that can be consumed by the dashboard
    await fs.writeFile(
      'dashboard-data.json', 
      JSON.stringify(dashboardData, null, 2)
    );
    
    console.log('Dashboard data updated successfully!');
    
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    process.exit(1);
  }
}

// Run the update function
updateDashboardData();