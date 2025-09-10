import winston from 'winston';
import { getConfig } from './config';

export class LoggerManager {
  private static instance: winston.Logger;

  public static getInstance(): winston.Logger {
    if (!LoggerManager.instance) {
      LoggerManager.instance = LoggerManager.createLogger();
    }
    return LoggerManager.instance;
  }

  private static createLogger(): winston.Logger {
    const config = getConfig();
    const isDevelopment = config.app.nodeEnv === 'development';

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: isDevelopment
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          : winston.format.json(),
      }),
    ];

    // Add file transport in production
    if (!isDevelopment) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.json(),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.json(),
        })
      );
    }

    return winston.createLogger({
      level: config.app.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'garvis',
        environment: config.app.nodeEnv,
      },
      transports,
    });
  }
}

export const logger = LoggerManager.getInstance();