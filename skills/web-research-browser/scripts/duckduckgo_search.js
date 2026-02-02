#!/usr/bin/env node

/**
 * DuckDuckGo Search Script
 * Provides web search functionality using DuckDuckGo without requiring an API key
 */

const { search } = require('duck-duck-scrape');

class DuckDuckGoSearch {
  constructor(options = {}) {
    this.delayBetweenRequests = options.delayBetweenRequests || 2000; // 2 seconds between requests
    this.lastRequestTime = 0;
  }

  /**
   * Perform a search with rate limiting
   * @param {string} query - Search query
   * @param {Object} options - Search options
   */
  async search(query, options = {}) {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delayBetweenRequests) {
      const delay = this.delayBetweenRequests - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      this.lastRequestTime = Date.now();
      const results = await search(query, options);
      
      // Format results consistently
      const formattedResults = this.formatResults(results);
      
      return {
        success: true,
        query,
        results: formattedResults,
        timestamp: new Date().toISOString(),
        totalResults: formattedResults.length
      };
    } catch (error) {
      return {
        success: false,
        query,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Format search results for consistent output
   * @param {Array} results - Raw search results
   */
  formatResults(results) {
    if (!results || !Array.isArray(results)) {
      return [];
    }

    return results.map((result, index) => ({
      rank: index + 1,
      title: result.title || '',
      url: result.url || '',
      snippet: result.description || result.snippet || '',
      hostname: result.hostname || this.extractHostname(result.url || '')
    }));
  }

  /**
   * Extract hostname from URL
   * @param {string} url
   */
  extractHostname(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  /**
   * Perform a simple search and return top results
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   */
  async simpleSearch(query, limit = 5) {
    const result = await this.search(query);
    
    if (!result.success) {
      return result;
    }
    
    return {
      ...result,
      results: result.results.slice(0, limit),
      totalResults: Math.min(result.totalResults, limit)
    };
  }
}

// Command-line interface
async function main() {
  const searchEngine = new DuckDuckGoSearch({ delayBetweenRequests: 2000 });
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === '--help' || command === '-h') {
    console.log(`
DuckDuckGo Search Script

Usage:
  node duckduckgo_search.js <search_query> [limit]

Examples:
  node duckduckgo_search.js "Netlify deployment issues" 5
  node duckduckgo_search.js "web development best practices"

Options:
  --help, -h     Show this help message
    `);
    return;
  }
  
  if (args.length === 0) {
    console.error('Error: Please provide a search query');
    console.log('Use --help for usage information');
    process.exit(1);
  }
  
  const query = args.slice(0, args.length - 1).join(' ') || args[0];
  const limit = parseInt(args[args.length - 1]) || 5;
  
  console.log(`Searching DuckDuckGo for: "${query}"`);
  console.log(`Limit: ${limit} results\n`);
  
  const results = await searchEngine.simpleSearch(query, limit);
  
  if (results.success) {
    console.log(`Found ${results.totalResults} results:\n`);
    
    results.results.forEach(result => {
      console.log(`${result.rank}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Snippet: ${result.snippet.substring(0, 200)}${result.snippet.length > 200 ? '...' : ''}`);
      console.log('');
    });
  } else {
    console.error(`Search failed: ${results.error}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DuckDuckGoSearch;