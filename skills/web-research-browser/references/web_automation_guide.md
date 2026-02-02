# Web Automation Guide

## Overview

This guide provides comprehensive information about web research and browser automation capabilities available to the agent.

## Web Search Capabilities

### Available Tools

#### 1. web_search
- **Function**: Search the web using Brave Search API
- **Requirements**: Brave Search API key
- **Setup**: `clawdbot configure --section web`
- **Usage**: `web_search(query="search term")`

#### 2. web_fetch
- **Function**: Fetch and extract content from URLs
- **Requirements**: No API key needed
- **Usage**: `web_fetch(url="https://example.com")`

## Browser Automation

### Available Actions

#### 1. Browser Control
- **Action**: `browser(action="start")` - Start the browser
- **Action**: `browser(action="status")` - Check browser status
- **Action**: `browser(action="snapshot")` - Capture current page
- **Action**: `browser(action="navigate", targetUrl="url")` - Navigate to URL
- **Action**: `browser(action="screenshot")` - Take screenshot

#### 2. Profile Options
- **chrome**: Uses existing Chrome installation with extension relay
- **clawd**: Uses isolated clawd-managed browser

### Prerequisites for Chrome Extension Relay

**Critical**: To use Chrome extension relay, a human must manually:
1. Install the Clawdbot Browser Relay extension in Chrome
2. Navigate to the desired webpage in Chrome
3. Click the Clawdbot extension icon to attach the tab
4. The tab will show a connected state

Only then can browser automation take control of that tab.

## Common Web Research Workflows

### 1. Documentation Research
```
# Search for documentation
web_search(query="netlify deployment github integration")

# Fetch specific documentation pages
web_fetch(url="https://docs.netlify.com/configuration-options/")
```

### 2. Service Status Checking
```
# Check if service is accessible
web_fetch(url="https://service-url.com")

# Analyze response content
# Look for status codes, error messages, etc.
```

### 3. Troubleshooting Deployment Issues
```
# Check deployment status
web_fetch(url="https://yoursite.netlify.app/")

# Research common issues
web_search(query="netlify deployment not updating after git push")

# Verify configuration
web_fetch(url="https://github.com/username/repository/blob/main/netlify.toml")
```

## Browser Automation Patterns

### 1. Service Dashboard Access
```
# Start browser (requires human to attach tab for chrome profile)
browser(action="start", profile="chrome")

# Navigate to service
browser(action="navigate", targetUrl="https://netlify.com/dashboard")

# Take snapshot to analyze UI
browser(action="snapshot", refs="aria")
```

### 2. Form Interaction
```
# Navigate to form
browser(action="navigate", targetUrl="https://example.com/form")

# Fill form fields
browser(action="act", request={kind: "fill", ref: "email-input", text: "test@example.com"})

# Submit form
browser(action="act", request={kind: "click", ref: "submit-button"})
```

## Best Practices

### 1. Web Research
- Start with broad search terms, then refine
- Verify information across multiple sources
- Check for recent updates to documentation
- Look for official documentation first

### 2. Error Handling
- Always check response status codes
- Handle network timeouts gracefully
- Verify content makes sense before proceeding
- Have fallback strategies when tools fail

### 3. Efficiency
- Cache results when possible
- Use specific search terms to reduce noise
- Combine multiple tools for comprehensive analysis
- Automate repetitive tasks but verify results

## Limitations

### 1. Authentication
- Cannot automatically log into services requiring authentication
- Human intervention needed for OAuth flows
- Some sites may block automated access

### 2. Dynamic Content
- May require additional waits for JavaScript to load
- Single-page applications may need special handling
- Some content loaded via AJAX may not be immediately visible

### 3. Rate Limits
- Respect service rate limits
- Implement delays between requests when needed
- Be mindful of bandwidth usage

## Security Considerations

- Do not access sensitive or personal information unnecessarily
- Verify URLs before accessing them
- Be cautious with form submissions
- Protect any credentials that may be exposed