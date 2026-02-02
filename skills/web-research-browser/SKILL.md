# Web Research and Browser Automation Skill

## Purpose
Enable autonomous web-based problem solving through comprehensive web search, content fetching, and browser automation capabilities. This skill allows the agent to independently research, diagnose, and solve web-based issues without requiring human intervention.

## Components

### 1. Web Search Capabilities
- DuckDuckGo search via web_fetch
- Content extraction and summarization
- Source verification and credibility assessment

### 2. Browser Automation
- Navigate to websites
- Interact with elements (click, type, form submission)
- Extract information from web pages
- Handle dynamic content and JavaScript

### 3. Autonomous Problem Solving
- Diagnose web-based issues independently
- Research solutions through web search
- Implement fixes through browser automation
- Report results and verification

## Prerequisites
- browser tool access
- web_fetch tool access
- Internet connectivity

## Usage Examples
- Diagnosing deployment issues by visiting sites
- Researching documentation online
- Logging into services to check status
- Verifying that changes actually occurred on websites

## Key Functions
- `search_web(query)` - Perform web searches to find information
- `browse_to(url)` - Navigate to specific URLs
- `extract_content(selector)` - Extract specific content from pages
- `verify_changes(url, expected_content)` - Verify that changes are live
- `autonomous_research(topic)` - Conduct comprehensive research on a topic

## Best Practices
- Always verify actual outcomes vs. assumptions
- Use multiple sources when researching
- Take screenshots when needed for documentation
- Handle errors gracefully and report findings clearly
- Respect robots.txt and rate limits