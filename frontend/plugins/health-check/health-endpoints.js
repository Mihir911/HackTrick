// webpack-health-plugin.js
// Webpack plugin that tracks compilation state and health metrics

class WebpackHealthPlugin {
    constructor() {
        this.status = {
            state: 'idle',           // idle, compiling, success, failed
            errors: [],
            warnings: [],
            lastCompileTime: null,
            lastSuccessTime: null,
            compileDuration: 0,
            totalCompiles: 0,
            firstCompileTime: null,
        };
    }

    apply(compiler) {
        const pluginName = 'WebpackHealthPlugin';

        // Hook: Compilation started
        compiler.hooks.compile.tap(pluginName, () => {
            const now = Date.now();
            this.status.state = 'compiling';
            this.status.lastCompileTime = now;

            if (!this.status.firstCompileTime) {
                this.status.firstCompileTime = now;
            }
        });

        // Hook: Compilation completed
        compiler.hooks.done.tap(pluginName, (stats) => {
            const info = stats.toJson({
                all: false,
                errors: true,
                warnings: true,
            });

            this.status.totalCompiles++;
            this.status.compileDuration = Date.now() - this.status.lastCompileTime;

            if (stats.hasErrors()) {
                this.status.state = 'failed';
                this.status.errors = info.errors.map(err => ({
                    message: err.message || String(err),
                    stack: err.stack,
                    moduleName: err.moduleName,
                    loc: err.loc,
                }));
            } else {
                this.status.state = 'success';
                this.status.lastSuccessTime = Date.now();
                this.status.errors = [];
            }

            if (stats.hasWarnings()) {
                this.status.warnings = info.warnings.map(warn => ({
                    message: warn.message || String(warn),
                    moduleName: warn.moduleName,
                    loc: warn.loc,
                }));
            } else {
                this.status.warnings = [];
            }
        });

        // Hook: Compilation failed
        compiler.hooks.failed.tap(pluginName, (error) => {
            this.status.state = 'failed';
            this.status.errors = [{
                message: error.message,
                stack: error.stack,
            }];
            this.status.compileDuration = Date.now() - this.status.lastCompileTime;
        });

        // Hook: Invalid (file changed, recompiling)
        compiler.hooks.invalid.tap(pluginName, () => {
            this.status.state = 'compiling';
        });
    }

    getStatus() {
        return {
            ...this.status,
            // Add computed fields
            isHealthy: this.status.state === 'success',
            errorCount: this.status.errors.length,
            warningCount: this.status.warnings.length,
            hasCompiled: this.status.totalCompiles > 0,
        };
    }

    // Get simplified status for quick checks
    getSimpleStatus() {
        return {
            state: this.status.state,
            isHealthy: this.status.state === 'success',
            errorCount: this.status.errors.length,
            warningCount: this.status.warnings.length,
        };
    }

    // Reset statistics (useful for testing)
    reset() {
        this.status = {
            state: 'idle',
            errors: [],
            warnings: [],
            lastCompileTime: null,
            lastSuccessTime: null,
            compileDuration: 0,
            totalCompiles: 0,
            firstCompileTime: null,
        };
    }
}

module.exports = WebpackHealthPlugin;
// health-endpoints.js
// API endpoints for health checks and monitoring

const os = require('os');

const SERVER_START_TIME = Date.now();

/**
 * Setup health check endpoints on the dev server
 * @param {Object} devServer - Webpack dev server instance
 * @param {Object} healthPlugin - Instance of WebpackHealthPlugin
 */
function setupHealthEndpoints(devServer, healthPlugin) {
    if (!devServer || !devServer.app) {
        console.warn('[Health Check] Dev server not available, skipping health endpoints');
        return;
    }

    if (!healthPlugin) {
        console.warn('[Health Check] Health plugin not provided, skipping health endpoints');
        return;
    }

    console.log('[Health Check] Setting up health endpoints...');

    // ====================================================================
    // GET /health - Detailed health status (JSON)
    // ====================================================================
    devServer.app.get("/health", (req, res) => {
        const webpackStatus = healthPlugin.getStatus();
        const uptime = Date.now() - SERVER_START_TIME;
        const memUsage = process.memoryUsage();

        res.json({
            status: webpackStatus.isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: {
                seconds: Math.floor(uptime / 1000),
                formatted: formatDuration(uptime),
            },
            webpack: {
                state: webpackStatus.state,
                isHealthy: webpackStatus.isHealthy,
                hasCompiled: webpackStatus.hasCompiled,
                errors: webpackStatus.errorCount,
                warnings: webpackStatus.warningCount,
                lastCompileTime: webpackStatus.lastCompileTime
                    ? new Date(webpackStatus.lastCompileTime).toISOString()
                    : null,
                lastSuccessTime: webpackStatus.lastSuccessTime
                    ? new Date(webpackStatus.lastSuccessTime).toISOString()
                    : null,
                compileDuration: webpackStatus.compileDuration
                    ? `${webpackStatus.compileDuration}ms`
                    : null,
                totalCompiles: webpackStatus.totalCompiles,
                firstCompileTime: webpackStatus.firstCompileTime
                    ? new Date(webpackStatus.firstCompileTime).toISOString()
                    : null,
            },
            server: {
                nodeVersion: process.version,
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                memory: {
                    heapUsed: formatBytes(memUsage.heapUsed),
                    heapTotal: formatBytes(memUsage.heapTotal),
                    rss: formatBytes(memUsage.rss),
                    external: formatBytes(memUsage.external),
                },
                systemMemory: {
                    total: formatBytes(os.totalmem()),
                    free: formatBytes(os.freemem()),
                    used: formatBytes(os.totalmem() - os.freemem()),
                },
            },
            environment: process.env.NODE_ENV || 'development',
        });
    });

    // ====================================================================
    // GET /health/simple - Simple text response (OK/COMPILING/ERROR)
    // ====================================================================
    devServer.app.get("/health/simple", (req, res) => {
        const webpackStatus = healthPlugin.getSimpleStatus();

        if (webpackStatus.state === 'success') {
            res.status(200).send('OK');
        } else if (webpackStatus.state === 'compiling') {
            res.status(200).send('COMPILING');
        } else if (webpackStatus.state === 'idle') {
            res.status(200).send('IDLE');
        } else {
            res.status(503).send('ERROR');
        }
    });

    // ====================================================================
    // GET /health/ready - Readiness check (Kubernetes/load balancer)
    // ====================================================================
    devServer.app.get("/health/ready", (req, res) => {
        const webpackStatus = healthPlugin.getSimpleStatus();

        if (webpackStatus.state === 'success') {
            res.status(200).json({
                ready: true,
                state: webpackStatus.state,
            });
        } else {
            res.status(503).json({
                ready: false,
                state: webpackStatus.state,
                reason: webpackStatus.state === 'compiling'
                    ? 'Compilation in progress'
                    : 'Compilation failed',
            });
        }
    });

    // ====================================================================
    // GET /health/live - Liveness check (Kubernetes)
    // ====================================================================
    devServer.app.get("/health/live", (req, res) => {
        res.status(200).json({
            alive: true,
            timestamp: new Date().toISOString(),
        });
    });

    // ====================================================================
    // GET /health/errors - Get current errors and warnings
    // ====================================================================
    devServer.app.get("/health/errors", (req, res) => {
        const webpackStatus = healthPlugin.getStatus();

        res.json({
            errorCount: webpackStatus.errorCount,
            warningCount: webpackStatus.warningCount,
            errors: webpackStatus.errors,
            warnings: webpackStatus.warnings,
            state: webpackStatus.state,
        });
    });

    // ====================================================================
    // GET /health/stats - Compilation statistics
    // ====================================================================
    devServer.app.get("/health/stats", (req, res) => {
        const webpackStatus = healthPlugin.getStatus();
        const uptime = Date.now() - SERVER_START_TIME;

        res.json({
            totalCompiles: webpackStatus.totalCompiles,
            averageCompileTime: webpackStatus.totalCompiles > 0
                ? `${Math.round(uptime / webpackStatus.totalCompiles)}ms`
                : null,
            lastCompileDuration: webpackStatus.compileDuration
                ? `${webpackStatus.compileDuration}ms`
                : null,
            firstCompileTime: webpackStatus.firstCompileTime
                ? new Date(webpackStatus.firstCompileTime).toISOString()
                : null,
            serverUptime: formatDuration(uptime),
        });
    });

    console.log('[Health Check] ✓ Health endpoints ready:');
    console.log('  • GET /health         - Detailed status');
    console.log('  • GET /health/simple  - Simple OK/ERROR');
    console.log('  • GET /health/ready   - Readiness check');
    console.log('  • GET /health/live    - Liveness check');
    console.log('  • GET /health/errors  - Error details');
    console.log('  • GET /health/stats   - Statistics');
}

// ====================================================================
// Helper Functions
// ====================================================================

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

module.exports = setupHealthEndpoints;
