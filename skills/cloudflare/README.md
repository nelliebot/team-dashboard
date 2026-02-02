# Cloudflare Skill for OpenClaw

A configurable skill for interacting with Cloudflare services. This skill grows and adapts as new Cloudflare capabilities are discovered and implemented.

## Overview

The Cloudflare skill provides a growing set of utilities for working with Cloudflare services. Currently focused on Pages deployment, with plans to expand to other Cloudflare products.

## Installation

The skill is part of the OpenClaw ecosystem and will be available when this directory is properly integrated with the skill system.

## Current Features

### Cloudflare Pages Deployment

Deploy static sites to Cloudflare Pages using Personal Access Tokens.

#### Usage

```bash
# Deploy a project to Cloudflare Pages
node skills/cloudflare/deploy-pages.js --project my-dashboard --directory ./dist

# With specific account ID
node skills/cloudflare/deploy-pages.js --project my-site --directory ./build --account-id abc123def456
```

#### Requirements

- Cloudflare Personal Access Token (PAT) with Pages permissions
- The PAT should be stored in one of these locations:
  - Environment variable: `CLOUDFLARE_API_TOKEN`
  - File: `/home/afdon/annie-for-nellie/nellie-cloudflare-pat` (for Nellie)
  - Other common locations as configured

## Configuration

The skill looks for the Cloudflare PAT in the following order:
1. Environment variable `CLOUDFLARE_API_TOKEN`
2. File at `/home/afdon/annie-for-nellie/nellie-cloudflare-pat`
3. Other common locations (./cloudflare-pat.txt, ../cloudflare-pat.txt, etc.)

## Extending the Skill

This skill is designed to be extensible. Future additions might include:

- DNS management utilities
- Cloudflare Workers deployment
- Cloudflare R2 storage integration
- Advanced analytics and monitoring
- Security configuration tools
- Domain management

## Security

- All credentials are handled securely
- Personal Access Tokens are not logged or exposed
- The skill follows best practices for credential management

## Development

To extend this skill:
1. Add new functionality in the `src/` directory (create if needed)
2. Update the `SKILL.md` file with new capabilities
3. Update this README with usage instructions
4. Add tests if applicable
5. Update the main skill interface to expose new functionality

## Commands

- `node deploy-pages.js [options]` - Deploy to Cloudflare Pages
- See `node deploy-pages.js --help` for detailed options

## Dependencies

- Node.js (v14 or higher)
- Wrangler CLI (automatically installed if not present)

## Troubleshooting

If deployment fails:
1. Verify your Cloudflare PAT has the correct permissions
2. Check that the directory to deploy exists
3. Ensure Wrangler CLI is installed (`npm install -g wrangler`)
4. Confirm your Cloudflare account ID is correct