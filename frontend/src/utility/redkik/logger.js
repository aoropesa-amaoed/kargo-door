const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
  };
  
  // Get log level from environment or default based on mode
  const getLogLevel = () => {
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
    if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
      return LOG_LEVELS[envLevel];
    }
    
    // Default: show all in dev, only warnings/errors in production
    return import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
  };
  
  const currentLogLevel = getLogLevel();
  

  const log = (level, method, message, ...args) => {
    if (level >= currentLogLevel) {
      const consoleMethod = console[method] || console.log;
      if (args.length > 0) {
        consoleMethod(message, ...args);
      } else {
        consoleMethod(message);
      }
    }
  };
  
 
  export const logger = {
  
    debug: (message, ...args) => {
      log(LOG_LEVELS.DEBUG, 'debug', `[DEBUG] ${message}`, ...args);
    },
  
    info: (message, ...args) => {
      log(LOG_LEVELS.INFO, 'info', `[INFO] ${message}`, ...args);
    },
  
 
    warn: (message, ...args) => {
      log(LOG_LEVELS.WARN, 'warn', `[WARN] ${message}`, ...args);
    },

    error: (message, ...args) => {
      log(LOG_LEVELS.ERROR, 'error', `[ERROR] ${message}`, ...args);
    },
  
   
    apiRequest: (method, url, data = null) => {
      if (currentLogLevel <= LOG_LEVELS.INFO) {
        const logData = { method, url };
        if (data) logData.data = data;
        // logger.info('API Request:', logData);
      }
    },
  
  
    apiResponse: (method, url, response) => {
      if (currentLogLevel <= LOG_LEVELS.INFO) {
        logger.info('API Response:', { method, url, response });
      }
    },
  
  
    apiError: (method, url, error) => {
      logger.error('API Error:', { method, url, error });
    },
    
  };
  
  
  export default logger;
  