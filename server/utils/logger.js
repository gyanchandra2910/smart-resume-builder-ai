/**
 * Production Logger Utility
 * Provides environment-aware logging for the application
 */

const logger = {
    /**
     * Log info messages (always shown)
     */
    info: (message, data = null) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
        if (data && process.env.NODE_ENV !== 'production') {
            console.log(JSON.stringify(data, null, 2));
        }
    },

    /**
     * Log error messages (always shown)
     */
    error: (message, error = null) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
        if (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error.stack || error);
            } else {
                console.error(error.message || error);
            }
        }
    },

    /**
     * Log warning messages (always shown)
     */
    warn: (message, data = null) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
        if (data && process.env.NODE_ENV !== 'production') {
            console.warn(JSON.stringify(data, null, 2));
        }
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (message, data = null) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`);
            if (data) {
                console.log(JSON.stringify(data, null, 2));
            }
        }
    },

    /**
     * Log success messages
     */
    success: (message, data = null) => {
        console.log(`[SUCCESS] ${new Date().toISOString()}: ${message}`);
        if (data && process.env.NODE_ENV !== 'production') {
            console.log(JSON.stringify(data, null, 2));
        }
    }
};

module.exports = logger;
