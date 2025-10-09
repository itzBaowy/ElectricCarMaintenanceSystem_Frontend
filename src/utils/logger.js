/**
 * Logger utility - Only logs in development mode
 * Prevents sensitive information leakage in production
 */

const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args)
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

export default logger
