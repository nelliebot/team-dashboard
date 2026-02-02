/**
 * Cloudflare Skill Main Interface
 * Coordinates various Cloudflare services and utilities
 */

const CloudflarePagesDeployer = require('./deploy-pages.js');

class CloudflareSkill {
    constructor() {
        this.services = {
            pages: null,
            workers: null,  // To be implemented
            dns: null,      // To be implemented
            r2: null,       // To be implemented
        };
        
        this.config = this.loadConfig();
    }

    /**
     * Load skill configuration
     */
    loadConfig() {
        // Default configuration
        const config = {
            defaultAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || null,
            defaultPAT: this.getStoredPAT(),
            autoInstallWrangler: true,
            timeout: 300000, // 5 minutes
        };

        return config;
    }

    /**
     * Get stored PAT from various sources
     */
    getStoredPAT() {
        // Try environment variable first
        if (process.env.CLOUDFLARE_API_TOKEN) {
            return process.env.CLOUDFLARE_API_TOKEN;
        }

        // Try known file locations
        const possiblePaths = [
            '/home/afdon/annie-for-nellie/nellie-cloudflare-pat',
            './cloudflare-pat.txt',
            '../cloudflare-pat.txt'
        ];

        for (const path of possiblePaths) {
            try {
                if (require('fs').existsSync(path)) {
                    return require('fs').readFileSync(path, 'utf8').trim();
                }
            } catch (e) {
                // Continue to next path if this one fails
                continue;
            }
        }

        return null;
    }

    /**
     * Deploy to Cloudflare Pages
     */
    async deployToPages(options = {}) {
        const deployer = new CloudflarePagesDeployer({
            ...options,
            ...(this.config.defaultPAT && { cfPat: this.config.defaultPAT }),
            ...(this.config.defaultAccountId && { accountId: this.config.defaultAccountId })
        });

        return await deployer.deploy();
    }

    /**
     * Create a new Cloudflare Pages project
     */
    async createPagesProject(options = {}) {
        const deployer = new CloudflarePagesDeployer({
            ...options,
            ...(this.config.defaultPAT && { cfPat: this.config.defaultPAT }),
            ...(this.config.defaultAccountId && { accountId: this.config.defaultAccountId })
        });

        return await deployer.createProject();
    }

    /**
     * Get project status
     */
    async getProjectStatus(projectName) {
        const deployer = new CloudflarePagesDeployer({
            projectName,
            ...(this.config.defaultPAT && { cfPat: this.config.defaultPAT })
        });

        return await deployer.getProjectStatus();
    }

    /**
     * Initialize the skill
     */
    async initialize() {
        console.log('🔌 Initializing Cloudflare Skill...');
        
        // Check if wrangler is available
        try {
            const { execSync } = require('child_process');
            execSync('wrangler --version', { stdio: 'pipe' });
            console.log('✅ Wrangler CLI is available');
        } catch (error) {
            if (this.config.autoInstallWrangler) {
                console.log('📦 Installing Wrangler CLI...');
                try {
                    await this.installWrangler();
                    console.log('✅ Wrangler CLI installed');
                } catch (installError) {
                    console.error('❌ Failed to install Wrangler:', installError.message);
                    throw installError;
                }
            } else {
                throw new Error('Wrangler CLI is not installed and auto-install is disabled');
            }
        }

        // Verify PAT is available
        if (!this.config.defaultPAT) {
            throw new Error('No Cloudflare PAT found. Please configure your PAT in the expected location.');
        }

        console.log('✅ Cloudflare Skill initialized successfully');
    }

    /**
     * Install Wrangler CLI
     */
    async installWrangler() {
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec('npm install -g wrangler', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    /**
     * Get skill status and available services
     */
    getStatus() {
        return {
            initialized: !!this.config.defaultPAT,
            services: {
                pages: 'Available',
                workers: 'Not implemented',
                dns: 'Not implemented',
                r2: 'Not implemented',
            },
            config: {
                hasPAT: !!this.config.defaultPAT,
                hasAccountId: !!this.config.defaultAccountId,
                autoInstallWrangler: this.config.autoInstallWrangler
            }
        };
    }

    /**
     * List available projects
     */
    async listProjects() {
        try {
            const { execSync } = require('child_process');
            const output = execSync('wrangler pages project list', { encoding: 'utf8' });
            
            // Parse the output to get project names
            const lines = output.split('\n');
            const projects = lines
                .filter(line => line.trim() && !line.includes('┌') && !line.includes('─') && !line.includes('│'))
                .map(line => line.trim())
                .filter(name => name.length > 0);
            
            return projects;
        } catch (error) {
            console.error('❌ Could not list projects:', error.message);
            return [];
        }
    }
}

// Export the skill class
module.exports = CloudflareSkill;

// If run directly, show status
if (require.main === module) {
    (async () => {
        try {
            const skill = new CloudflareSkill();
            const status = skill.getStatus();
            console.log('☁️  Cloudflare Skill Status:');
            console.log(JSON.stringify(status, null, 2));
        } catch (error) {
            console.error('❌ Error initializing Cloudflare skill:', error.message);
        }
    })();
}