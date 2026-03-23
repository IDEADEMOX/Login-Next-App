// app/utils/logger.util.ts
export const logger = {
  info: (message: string, meta: Record<string, any> = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  warn: (message: string, meta: Record<string, any> = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  },
  error: (message: string, meta: Record<string, any> = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
  },
  debug: (message: string, meta: Record<string, any> = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
    }
  },
};
