/**
 * Sistema de logging configurável para o projeto Mithra
 * Permite controle de logs por ambiente (development, production)
 */

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile?: boolean;
  filePath?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: (process.env.LOG_LEVEL as any) || 'info',
      enableConsole: process.env.NODE_ENV === 'development' || config.enableConsole || false,
      ...config
    };
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error') && this.config.enableConsole) {
      console.error(this.formatMessage('error', message, error));
    }
  }

  // Método para logs de API específicos
  api(operation: string, params?: any, duration?: number): void {
    const message = `API ${operation}`;
    const data = {
      params,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    };
    
    this.info(message, data);
  }

  // Método para logs de queries SQL
  sql(query: string, params?: any[], duration?: number): void {
    const message = 'SQL Query';
    const data = {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    };
    
    this.debug(message, data);
  }
}

// Instância global do logger
export const logger = new Logger();

// Função para criar logger específico para uma funcionalidade
export function createLogger(module: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger({
    ...config,
    enableConsole: process.env.NODE_ENV === 'development' || config?.enableConsole || false
  });
}

export default logger; 