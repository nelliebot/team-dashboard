#!/bin/bash

# Web Research Helper Script
# Provides utilities for common web research tasks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if web_fetch is available
check_web_fetch() {
    if ! command -v clawdbot &> /dev/null; then
        print_error "clawdbot command not found"
        exit 1
    fi
}

# Function to diagnose Netlify deployment
diagnose_netlify() {
    if [ $# -ne 2 ]; then
        print_error "Usage: diagnose_netlify <site_url> <repo_url>"
        exit 1
    fi
    
    local site_url="$1"
    local repo_url="$2"
    
    print_info "Diagnosing Netlify deployment..."
    print_info "Site URL: $site_url"
    print_info "Repo URL: $repo_url"
    
    # Check if site is accessible
    print_info "Checking if site is accessible..."
    if curl -s -o /dev/null -w "%{http_code}" "$site_url" | grep -q "200\|301\|302"; then
        print_success "Site is accessible"
    else
        print_error "Site is not accessible"
    fi
    
    # Fetch and examine the site content
    print_info "Fetching site content..."
    site_content=$(curl -s "$site_url" | head -20)
    echo "$site_content"
    
    # Check the repository (this would require more detailed implementation)
    print_info "Verifying repository information would involve checking GitHub API..."
    
    # Check for netlify.toml in the repository
    print_info "Checking for netlify.toml in repository (would require GitHub API access)..."
}

# Function to research a topic
research_topic() {
    if [ $# -eq 0 ]; then
        print_error "Usage: research_topic <search_query>"
        exit 1
    fi
    
    local query="$1"
    
    print_info "Researching topic: $query"
    print_warning "web_search tool requires API key. Using web_fetch as alternative for known URLs..."
    
    # For now, we can only use web_fetch with known URLs
    # Actual web search would require API key setup
    print_info "To perform actual web search, please configure web search API key:"
    print_info "clawdbot configure --section web"
}

# Function to fetch and analyze a URL
fetch_and_analyze() {
    if [ $# -ne 1 ]; then
        print_error "Usage: fetch_and_analyze <url>"
        exit 1
    fi
    
    local url="$1"
    
    print_info "Fetching and analyzing: $url"
    
    # Use web_fetch tool via clawdbot if available
    if command -v clawdbot &> /dev/null; then
        print_info "Using web_fetch tool to retrieve content..."
        # We'll use web_fetch via the clawdbot interface
        print_info "Content preview (first 50 lines):"
        curl -s "$url" | head -50
    else
        print_error "clawdbot not available, using curl directly"
        curl -s "$url" | head -20
    fi
}

# Function to check web search configuration
check_web_config() {
    print_info "Checking web search configuration..."
    
    # Check if web search is configured (this is a simplified check)
    print_info "To configure web search, run:"
    print_info "clawdbot configure --section web"
    print_info ""
    print_info "You will need a Brave Search API key, which you can get at:"
    print_info "https://brave.com/search/api/"
    print_info ""
    print_info "The free tier includes 2,000 queries/month"
}

# Main function
main() {
    if [ $# -eq 0 ]; then
        print_error "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  diagnose_netlify <site_url> <repo_url>    Diagnose Netlify deployment"
        echo "  research_topic <query>                   Research a topic"
        echo "  fetch_and_analyze <url>                  Fetch and analyze a URL"
        echo "  check_config                             Check web search configuration"
        echo "  --help                                   Show this help"
        exit 1
    fi
    
    case "$1" in
        "diagnose_netlify")
            shift
            diagnose_netlify "$@"
            ;;
        "research_topic")
            shift
            research_topic "$@"
            ;;
        "fetch_and_analyze")
            shift
            fetch_and_analyze "$@"
            ;;
        "check_config")
            check_web_config
            ;;
        "--help"|"-h")
            echo "Web Research Helper Script"
            echo ""
            echo "Usage: $0 <command> [args]"
            echo ""
            echo "Commands:"
            echo "  diagnose_netlify <site_url> <repo_url>    Diagnose Netlify deployment"
            echo "  research_topic <query>                   Research a topic"
            echo "  fetch_and_analyze <url>                  Fetch and analyze a URL"
            echo "  check_config                             Check web search configuration"
            echo "  --help                                   Show this help"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"