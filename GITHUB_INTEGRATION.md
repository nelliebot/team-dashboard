# GitHub Integration Setup

This dashboard can integrate with GitHub APIs to show real-time data about repositories, issues, pull requests, and other activity.

## Prerequisites

- A GitHub account
- A GitHub Personal Access Token (PAT) with appropriate permissions

## Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Give your token a descriptive name (e.g., "Team Dashboard")
4. Select scopes/permissions:
   - `repo` - to access repositories
   - `read:org` - to read organization info (if needed)
   - `read:user` - to read user profile data
   - `notifications` - to read notifications
5. Click "Generate token"
6. Copy the generated token (you won't be able to see it again)

## Configuring the Dashboard

### For Local Development

1. Open the dashboard in your browser
2. Open browser developer tools (F12)
3. In the Console tab, run:
   ```javascript
   saveGitHubToken('your_personal_access_token_here')
   ```
   
### For Production Deployment

For production deployments, you can modify the dashboard to retrieve the token from environment variables or a secure storage mechanism.

## Configuration File

The dashboard reads from `config.json` to determine which repositories to monitor:

```json
{
  "github": {
    "repositories": [
      "your-username/repository-name",
      "organization/repository-name"
    ]
  }
}
```

## Available Data

Once configured, the dashboard will display:

- Repository statistics (stars, forks)
- Open and closed issues count
- Open and merged pull requests count
- Recent commits
- Recent activity events
- Detailed repository information

## API Rate Limits

GitHub API has rate limits:
- Authenticated requests: 5,000 requests per hour
- Unauthenticated requests: 60 requests per hour

The dashboard includes rate limit awareness and will adjust polling frequency accordingly.

## Security Considerations

⚠️ **Important Security Notes:**

- Never commit personal access tokens to version control
- Tokens are stored in browser localStorage (not secure for production)
- For production use, implement server-side token management
- Use tokens with minimal required permissions
- Regularly rotate tokens

## Troubleshooting

If GitHub integration isn't working:

1. Verify your token has the correct permissions
2. Check browser console for error messages
3. Ensure the repository names in config.json are correct
4. Confirm you have access to the specified repositories