/**
 * Utility functions for web research and browser automation
 */

/**
 * Format search results for display
 * @param {Array} results - Search results array
 * @returns {string} Formatted results
 */
function formatSearchResults(results) {
    if (!results || results.length === 0) {
        return "No search results found.";
    }
    
    let output = `Found ${results.length} results:\n\n`;
    
    results.forEach((result, index) => {
        output += `${index + 1}. ${result.title || 'No title'}\n`;
        output += `   URL: ${result.url || 'No URL'}\n`;
        output += `   Snippet: ${result.snippet || 'No snippet'}\n\n`;
    });
    
    return output;
}

/**
 * Validate and sanitize URLs
 * @param {string} url - URL to validate
 * @returns {string|null} Validated URL or null if invalid
 */
function validateUrl(url) {
    if (!url) return null;
    
    try {
        // Basic URL validation
        let validatedUrl = url.trim();
        
        // Add protocol if missing
        if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
            validatedUrl = 'https://' + validatedUrl;
        }
        
        // Basic validation
        const urlObj = new URL(validatedUrl);
        
        // Check if protocol is HTTP or HTTPS
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            return null;
        }
        
        return validatedUrl;
    } catch (error) {
        console.error(`Invalid URL: ${url}`, error);
        return null;
    }
}

/**
 * Extract main content from HTML-like text (simplified)
 * @param {string} html - HTML content
 * @returns {string} Extracted text content
 */
function extractMainContent(html) {
    if (!html) return '';
    
    // Remove script and style elements
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags and decode entities
    cleaned = cleaned.replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

/**
 * Parse search results from HTML content
 * @param {string} html - HTML content from search results
 * @returns {Array} Parsed search results
 */
function parseSearchResults(html) {
    const results = [];
    
    // This is a simplified parser - a real implementation would use a proper HTML parser
    const linkRegex = /href="(https?:\/\/[^"]+)"/g;
    const titleRegex = />([^<]+)<\/a>/g;
    
    // Find all links in the content
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const url = match[1];
        
        // Skip certain domains that aren't actual results
        if (!url.includes('duckduckgo.com') && !url.includes('google.com')) {
            results.push({
                url: url,
                title: extractTitleFromUrl(url),
                position: results.length + 1
            });
        }
    }
    
    return results;
}

/**
 * Extract a title from a URL if no title is available
 * @param {string} url - URL to extract title from
 * @returns {string} Extracted title
 */
function extractTitleFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        
        // Try to create a readable title from the URL
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
            // Use the last path segment as title if it looks like content
            const lastSegment = pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/_/g, ' ');
            if (lastSegment.length > 3) {
                return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
            }
        }
        
        return hostname;
    } catch (error) {
        return url.substring(0, 50) + '...';
    }
}

/**
 * Sanitize content for display
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
function sanitizeContent(content) {
    if (!content) return '';
    
    // Remove excessive whitespace and normalize
    return content
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
}

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (error) {
        return url;
    }
}

/**
 * Estimate content readability score
 * @param {string} content - Content to analyze
 * @returns {number} Readability score (0-1)
 */
function estimateReadability(content) {
    if (!content || content.length < 100) {
        return 0;
    }
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
        return 0;
    }
    
    // Simple readability heuristic
    const avgSentenceLength = words.length / sentences.length;
    const contentLengthScore = Math.min(1, content.length / 10000); // Normalize to 0-1 scale
    
    // Prefer moderate sentence lengths (8-16 words)
    const sentenceLengthScore = Math.max(0, 1 - Math.abs(avgSentenceLength - 12) / 12);
    
    return (contentLengthScore + sentenceLengthScore) / 2;
}

module.exports = {
    formatSearchResults,
    validateUrl,
    extractMainContent,
    parseSearchResults,
    extractTitleFromUrl,
    sanitizeContent,
    extractDomain,
    estimateReadability
};