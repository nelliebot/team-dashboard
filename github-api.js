/**
 * GitHub API Integration for Team Dashboard
 * Handles fetching real-time data from GitHub repositories
 */

class GitHubAPI {
    constructor(token) {
        this.token = token;
        this.apiEndpoint = 'https://api.github.com';
        this.headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Team-Dashboard'
        };
    }

    /**
     * Fetch repository data
     */
    async getRepository(owner, repo) {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/repos/${owner}/${repo}`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching repository data:', error);
            throw error;
        }
    }

    /**
     * Fetch issues for a repository
     */
    async getIssues(owner, repo, state = 'open') {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/repos/${owner}/${repo}/issues?state=${state}&sort=updated&direction=desc`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching issues:', error);
            throw error;
        }
    }

    /**
     * Fetch pull requests for a repository
     */
    async getPullRequests(owner, repo, state = 'open') {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/repos/${owner}/${repo}/pulls?state=${state}&sort=updated&direction=desc`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching pull requests:', error);
            throw error;
        }
    }

    /**
     * Fetch recent commits for a repository
     */
    async getCommits(owner, repo, per_page = 10) {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/repos/${owner}/${repo}/commits?per_page=${per_page}`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching commits:', error);
            throw error;
        }
    }

    /**
     * Fetch repository activity (events)
     */
    async getEvents(owner, repo, per_page = 20) {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/repos/${owner}/${repo}/events?per_page=${per_page}`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    /**
     * Fetch user information
     */
    async getUser(username) {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/users/${username}`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    /**
     * Get rate limit information
     */
    async getRateLimit() {
        try {
            const response = await fetch(
                `${this.apiEndpoint}/rate_limit`,
                { headers: this.headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching rate limit:', error);
            throw error;
        }
    }
}

/**
 * Dashboard Data Aggregator
 * Combines data from multiple sources to create dashboard-ready data
 */
class DashboardDataAggregator {
    constructor(githubApi) {
        this.githubApi = githubApi;
        this.config = null;
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            // Return default config
            this.config = {
                github: {
                    repositories: ['nelliebot/team-dashboard']
                }
            };
            return this.config;
        }
    }

    async collectAllData() {
        if (!this.config) {
            await this.loadConfig();
        }

        const results = {
            timestamp: new Date().toISOString(),
            repositories: {},
            aggregated: {
                totalIssues: 0,
                openIssues: 0,
                closedIssues: 0,
                totalPRs: 0,
                openPRs: 0,
                mergedPRs: 0,
                totalCommits: 0,
                recentActivity: []
            }
        };

        // Process each configured repository
        for (const repoPath of this.config.github.repositories) {
            const [owner, repo] = repoPath.split('/');

            try {
                // Fetch repository data
                const repoData = await this.githubApi.getRepository(owner, repo);
                
                // Fetch issues
                const issues = await this.githubApi.getIssues(owner, repo);
                const openIssues = issues.filter(issue => !issue.pull_request);
                const closedIssues = await this.githubApi.getIssues(owner, repo, 'closed');
                
                // Fetch pull requests
                const prs = await this.githubApi.getPullRequests(owner, repo);
                const mergedPRs = await this.githubApi.getPullRequests(owner, repo, 'closed');
                
                // Fetch commits
                const commits = await this.githubApi.getCommits(owner, repo);
                
                // Fetch recent events
                const events = await this.githubApi.getEvents(owner, repo);

                // Store repository-specific data
                results.repositories[repoPath] = {
                    metadata: repoData,
                    issues: {
                        open: openIssues,
                        closed: closedIssues,
                        count: openIssues.length + closedIssues.length
                    },
                    pullRequests: {
                        open: prs,
                        merged: mergedPRs,
                        count: prs.length + mergedPRs.filter(pr => pr.merged_at).length
                    },
                    commits: {
                        recent: commits,
                        count: commits.length
                    },
                    events: events
                };

                // Update aggregated counts
                results.aggregated.totalIssues += openIssues.length + closedIssues.length;
                results.aggregated.openIssues += openIssues.length;
                results.aggregated.closedIssues += closedIssues.length;
                results.aggregated.totalPRs += prs.length + mergedPRs.filter(pr => pr.merged_at).length;
                results.aggregated.openPRs += prs.length;
                results.aggregated.mergedPRs += mergedPRs.filter(pr => pr.merged_at).length;
                results.aggregated.totalCommits += commits.length;

                // Add recent events to activity feed
                events.slice(0, 5).forEach(event => {
                    results.aggregated.recentActivity.push({
                        type: event.type,
                        repo: repoPath,
                        actor: event.actor.login,
                        created_at: event.created_at,
                        payload: event.payload
                    });
                });

            } catch (error) {
                console.error(`Error collecting data for ${repoPath}:`, error);
            }
        }

        // Sort recent activity by date
        results.aggregated.recentActivity.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        return results;
    }

    /**
     * Format data for dashboard consumption
     */
    formatForDashboard(rawData) {
        const formatted = {
            lastUpdated: rawData.timestamp,
            summary: {
                totalRepositories: Object.keys(rawData.repositories).length,
                totalOpenIssues: rawData.aggregated.openIssues,
                totalOpenPRs: rawData.aggregated.openPRs,
                totalMergedPRs: rawData.aggregated.mergedPRs,
                totalCommits: rawData.aggregated.totalCommits
            },
            repositories: {}
        };

        // Format each repository's data
        for (const [repoPath, repoData] of Object.entries(rawData.repositories)) {
            formatted.repositories[repoPath] = {
                name: repoData.metadata.name,
                description: repoData.metadata.description,
                stars: repoData.metadata.stargazers_count,
                forks: repoData.metadata.forks_count,
                issues: {
                    open: repoData.issues.open.length,
                    closed: repoData.issues.closed.length,
                    recent: repoData.issues.open.slice(0, 5).map(issue => ({
                        id: issue.number,
                        title: issue.title,
                        state: issue.state,
                        author: issue.user.login,
                        created_at: issue.created_at,
                        labels: issue.labels.map(l => l.name)
                    }))
                },
                pullRequests: {
                    open: repoData.pullRequests.open.length,
                    merged: repoData.pullRequests.merged.filter(pr => pr.merged_at).length,
                    recent: repoData.pullRequests.open.slice(0, 5).map(pr => ({
                        id: pr.number,
                        title: pr.title,
                        state: pr.state,
                        author: pr.user.login,
                        created_at: pr.created_at,
                        labels: pr.labels ? pr.labels.map(l => l.name) : []
                    }))
                }
            };
        }

        return formatted;
    }
}

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GitHubAPI, DashboardDataAggregator };
}

// Initialize GitHub API integration when dashboard loads
document.addEventListener('DOMContentLoaded', async function() {
    // Try to get token from config or environment
    let token = localStorage.getItem('github-token');
    
    if (!token) {
        // In a real implementation, you would have the user input their token
        // For now, we'll show a notification that GitHub integration is disabled
        console.log('GitHub token not found. GitHub integration disabled.');
        // We could add a modal here to request the token from the user
    } else {
        try {
            const githubApi = new GitHubAPI(token);
            const aggregator = new DashboardDataAggregator(githubApi);
            
            // Update dashboard with GitHub data
            const rawData = await aggregator.collectAllData();
            const formattedData = aggregator.formatForDashboard(rawData);
            
            // Update the dashboard with new data
            updateDashboardWithData(formattedData);
            
        } catch (error) {
            console.error('Error initializing GitHub integration:', error);
        }
    }
});

/**
 * Update dashboard with fetched GitHub data
 */
function updateDashboardWithData(data) {
    // Update summary statistics
    document.querySelector('[data-summary="repositories"]').textContent = data.summary.totalRepositories;
    document.querySelector('[data-summary="open-issues"]').textContent = data.summary.totalOpenIssues;
    document.querySelector('[data-summary="open-prs"]').textContent = data.summary.totalOpenPRs;
    document.querySelector('[data-summary="merged-prs"]').textContent = data.summary.totalMergedPRs;
    
    // Update repository cards if they exist
    for (const [repoPath, repoData] of Object.entries(data.repositories)) {
        const repoCard = document.querySelector(`[data-repo="${repoPath}"]`);
        if (repoCard) {
            // Update repo card with new data
            repoCard.querySelector('.repo-name').textContent = repoData.name;
            repoCard.querySelector('.repo-stars').textContent = repoData.stars;
            repoCard.querySelector('.repo-issues-open').textContent = repoData.issues.open;
            repoCard.querySelector('.repo-prs-open').textContent = repoData.pullRequests.open;
        }
    }
    
    // Add to activity feed
    if (data.summary.totalOpenIssues > 0) {
        addActivity(`Fetched data from ${data.summary.totalRepositories} repositories`, 'system', 'info');
        addActivity(`Found ${data.summary.totalOpenIssues} open issues across all repos`, 'system', 'info');
    }
}