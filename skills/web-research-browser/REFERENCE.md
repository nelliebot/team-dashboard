# Web Research and Browser Automation Skill - Reference Guide

## Overview
This skill provides comprehensive web research and browser automation capabilities, enabling autonomous web-based problem solving through search, content fetching, and browser interaction.

## Core Functions

### 1. searchWeb(query)
- Performs web search using DuckDuckGo
- Returns array of search results with titles, URLs, and snippets
- Handles search errors gracefully
- Limits results to prevent overload

### 2. browseTo(url)
- Navigates to specific URL and fetches content
- Validates URL format before attempting to visit
- Returns content with metadata and success status
- Handles errors and provides error details

### 3. verifyContentExists(url, expectedContent)
- Checks if specific content exists on a webpage
- Case-insensitive matching
- Returns boolean indicating presence of content
- Useful for verifying deployments or changes

### 4. autonomousResearch(topic)
- Conducts comprehensive research on a topic
- Searches web, visits top results, extracts information
- Calculates relevance scores for content
- Returns organized research data

### 5. verifySiteChanges(url, expectedChanges)
- Verifies that multiple expected changes are live on a website
- Checks each expected change individually
- Returns detailed verification results
- Reports whether all changes were verified

## Usage Examples

### Basic Web Search
```javascript
const results = await webResearchBrowser.searchWeb("OpenClaw documentation");
console.log(formatSearchResults(results));
```

### Verify Deployment
```javascript
const isDeployed = await webResearchBrowser.verifyContentExists(
    "https://my-site.pages.dev", 
    "Welcome to my site"
);
```

### Research Topic
```javascript
const research = await webResearchBrowser.autonomousResearch(
    "Cloudflare Pages deployment issues"
);
```

### Verify Multiple Changes
```javascript
const verification = await webResearchBrowser.verifySiteChanges(
    "https://my-site.pages.dev",
    ["new feature", "updated design", "enhanced dashboard"]
);
```

## Best Practices

### Search Optimization
- Use specific, targeted queries
- Include relevant keywords and context terms
- Check multiple sources for accuracy
- Verify information across different sites

### Content Verification
- Always verify actual outcomes vs. assumptions
- Check multiple elements on a page for changes
- Use descriptive content strings for verification
- Allow for slight variations in content

### Error Handling
- Handle network errors gracefully
- Provide fallback options when possible
- Log errors for debugging
- Report failures clearly to users

### Rate Limiting
- Respect website rate limits
- Space out requests to avoid being blocked
- Implement retry logic for transient failures
- Use exponential backoff when appropriate

## Integration with OpenClaw

### Tool Compatibility
- Compatible with web_fetch tool for content retrieval
- Works with browser tool for advanced automation
- Integrates with memory system for persistent research
- Uses standard OpenClaw error handling

### Memory Integration
- Stores research results in memory
- Tracks verification results
- Maintains search history
- Preserves important findings

## Common Use Cases

### Deployment Verification
- Verify that sites are live after deployment
- Check that specific content changes are reflected
- Monitor site availability and content accuracy

### Research and Information Gathering
- Find documentation and tutorials
- Research solutions to technical problems
- Gather information on new technologies

### Site Monitoring
- Check if sites are accessible
- Verify that content remains as expected
- Detect changes or outages

### Autonomous Problem Solving
- Research solutions to encountered issues
- Verify that implemented fixes worked
- Find alternatives when approaches fail

## Troubleshooting

### Search Issues
- If search results are poor, try more specific queries
- Use quotation marks for exact phrase matching
- Include technical terms and specific keywords

### Content Verification Issues
- If content isn't found, check for case sensitivity
- Verify that content actually exists on the page
- Allow for formatting differences in the content

### Connection Issues
- Check internet connectivity
- Verify that URLs are accessible
- Consider firewall or network restrictions

## Security Considerations

### Safe Browsing
- Only visit trusted domains when possible
- Validate URLs before visiting
- Be aware of potential malicious content
- Report suspicious sites appropriately

### Data Protection
- Don't extract sensitive information unnecessarily
- Respect privacy and terms of service
- Be mindful of scraping limitations
- Honor robots.txt when possible

This skill enhances the agent's ability to work independently on web-based tasks, research solutions, and verify outcomes autonomously.