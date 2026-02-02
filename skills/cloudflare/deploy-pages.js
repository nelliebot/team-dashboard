#!/usr/bin/env node

/**
 * Cloudflare Pages Deployment Utility
 * Part of the Cloudflare Skill for OpenClaw
 * 
 * This script handles deployment to Cloudflare Pages with various configuration options
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class CloudflarePagesDeployer {
    constructor(options = {}) {
        this.options = {
            projectName: options.projectName || 'my-project',
            directory: options.directory || './dist',
            accountId: options.accountId || process.env.CLOUDFLARE_ACCOUNT_ID,
            gitBranch: options.gitBranch || 'main',
            ...options
        };
        
        // Try to get the PAT from known locations
        this.cfPat = this.getCloudflarePAT();
    }

    /**
     * Get Cloudflare PAT from various sources
     */
    getCloudflarePAT() {
        // First try environment variable
        if (process.env.CLOUDFLARE_API_TOKEN) {
            return process.env.CLOUDFLARE_API_TOKEN;
        }
        
        // Then try the Annie hand-off folder
        const patPath = '/home/afdon/annie-for-nellie/nellie-cloudflare-pat';
        if (fs.existsSync(patPath)) {
            return fs.readFileSync(patPath, 'utf8').trim();
        }
        
        // Try other common locations
        const possiblePaths = [
            './cloudflare-pat.txt',
            '../cloudflare-pat.txt',
            '~/.cloudflare-pat',
            '/etc/cloudflare-pat'
        ];
        
        for (const patPath of possiblePaths) {
            const resolvedPath = path.resolve(patPath.replace('~', require('os').homedir()));
            if (fs.existsSync(resolvedPath)) {
                return fs.readFileSync(resolvedPath, 'utf8').trim();
            }
        }
        
        return null;
    }

    /**
     * Check if wrangler is installed
     */
    isWranglerInstalled() {
        try {
            execSync('wrangler --version', { stdio: 'pipe' });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Install wrangler if not installed
     */
    async installWrangler() {
        console.log('📦 Installing Wrangler CLI...');
        
        try {
            await this.executeCommand('npm install -g wrangler');
            console.log('✅ Wrangler installed successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to install Wrangler:', error.message);
            return false;
        }
    }

    /**
     * Execute a command with proper error handling
     */
    executeCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const child = execSync(command, {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    CLOUDFLARE_API_TOKEN: this.cfPat
                },
                ...options
            });
            
            resolve(child);
        });
    }

    /**
     * Authenticate with Cloudflare using PAT
     */
    async authenticate() {
        if (!this.cfPat) {
            throw new Error('Cloudflare PAT not found! Please ensure the PAT is available in expected locations.');
        }

        console.log('🔐 Authenticating with Cloudflare...');
        
        try {
            // Set the token as environment variable for the session
            process.env.CLOUDFLARE_API_TOKEN = this.cfPat;
            
            // Test authentication by getting account info
            const accountInfo = execSync('wrangler config list', { encoding: 'utf8' });
            console.log('✅ Authentication successful!');
            return true;
        } catch (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }
    }

    /**
     * Deploy to Cloudflare Pages
     */
    async deploy() {
        console.log(`🚀 Deploying to Cloudflare Pages...`);
        
        // Validate inputs
        if (!fs.existsSync(this.options.directory)) {
            throw new Error(`Directory ${this.options.directory} does not exist!`);
        }

        // Install wrangler if needed
        if (!this.isWranglerInstalled()) {
            const installed = await this.installWrangler();
            if (!installed) {
                throw new Error('Failed to install Wrangler CLI');
            }
        }

        // Authenticate
        const authenticated = await this.authenticate();
        if (!authenticated) {
            throw new Error('Authentication failed');
        }

        try {
            console.log(`📂 Deploying directory: ${this.options.directory}`);
            console.log(`🏷️  Project name: ${this.options.projectName}`);
            
            // Set environment variables for the deployment
            const env = {
                ...process.env,
                CLOUDFLARE_API_TOKEN: this.cfPat,
                CLOUDFLARE_ACCOUNT_ID: this.options.accountId
            };

            // Execute the deployment command
            const deployCmd = `wrangler pages deploy ${this.options.directory} --project-name=${this.options.projectName}`;
            
            console.log('⏳ Running deployment command...');
            execSync(deployCmd, { 
                stdio: 'inherit', 
                env: env,
                cwd: process.cwd()
            });
            
            console.log('✅ Deployment completed successfully!');
            
            // Get the deployment URL
            const projectInfo = execSync(`wrangler pages project info ${this.options.projectName}`, { encoding: 'utf8' });
            console.log('📋 Project info:', projectInfo);
            
            return {
                success: true,
                project: this.options.projectName,
                directory: this.options.directory,
                url: `https://${this.options.projectName}.pages.dev`
            };
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            throw error;
        }
    }

    /**
     * Create a new Cloudflare Pages project
     */
    async createProject() {
        console.log(`_CREATING new Cloudflare Pages project: ${this.options.projectName}...`);
        
        try {
            const cmd = `wrangler pages project create ${this.options.projectName} --production-branch=${this.options.gitBranch}`;
            execSync(cmd, { 
                stdio: 'inherit', 
                env: { ...process.env, CLOUDFLARE_API_TOKEN: this.cfPat }
            });
            
            console.log('✅ Project created successfully!');
            return true;
        } catch (error) {
            console.error('❌ Project creation failed:', error.message);
            throw error;
        }
    }

    /**
     * Get deployment status
     */
    async getProjectStatus() {
        try {
            const status = execSync(`wrangler pages project info ${this.options.projectName}`, { encoding: 'utf8' });
            console.log('📊 Project Status:');
            console.log(status);
            return status;
        } catch (error) {
            console.error('❌ Could not retrieve project status:', error.message);
            return null;
        }
    }
}

/**
 * Main execution function
 */
async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};
    
    // Simple argument parsing
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--project' && args[i + 1]) {
            options.projectName = args[i + 1];
            i++;
        } else if (args[i] === '--directory' && args[i + 1]) {
            options.directory = args[i + 1];
            i++;
        } else if (args[i] === '--account-id' && args[i + 1]) {
            options.accountId = args[i + 1];
            i++;
        } else if (args[i] === '--branch' && args[i + 1]) {
            options.gitBranch = args[i + 1];
            i++;
        } else if (args[i] === '--help') {
            console.log(`
Cloudflare Pages Deployment Utility

Usage:
  node deploy-pages.js [options]

Options:
  --project NAME          Project name for Cloudflare Pages
  --directory DIR         Directory to deploy (default: ./dist)
  --account-id ID         Cloudflare Account ID
  --branch BRANCH         Git branch for production (default: main)
  --help                  Show this help message

Examples:
  node deploy-pages.js --project my-dashboard --directory ./dist
  node deploy-pages.js --project my-site --account-id abc123
            `);
            process.exit(0);
        }
    }

    // Set defaults if not provided
    options.projectName = options.projectName || 'my-project';
    options.directory = options.directory || './dist';

    try {
        const deployer = new CloudflarePagesDeployer(options);
        
        // Perform deployment
        const result = await deployer.deploy();
        
        console.log('\n🎉 Deployment Summary:');
        console.log(`   Project: ${result.project}`);
        console.log(`   Directory: ${result.directory}`);
        console.log(`   URL: ${result.url}`);
        console.log('\n✨ Success!');
    } catch (error) {
        console.error('\n💥 Deployment failed:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = CloudflarePagesDeployer;

// Run if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}