import { config } from 'dotenv';
import { GarvisConfig, ConfigurationError } from '../types';

config();

export class ConfigManager {
  private static instance: ConfigManager;
  private _config: GarvisConfig;

  private constructor() {
    this._config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public get config(): GarvisConfig {
    return this._config;
  }

  private loadConfig(): GarvisConfig {
    this.validateRequiredEnvVars();

    return {
      slack: {
        botToken: process.env.SLACK_BOT_TOKEN!,
        appToken: process.env.SLACK_APP_TOKEN!,
        signingSecret: process.env.SLACK_SIGNING_SECRET!,
      },
      app: {
        nodeEnv: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info',
        port: parseInt(process.env.PORT || '3000', 10),
      },
      agents: {
        timeout: parseInt(process.env.AGENT_TIMEOUT || '30000', 10),
        maxConcurrentAgents: parseInt(process.env.MAX_CONCURRENT_AGENTS || '10', 10),
      },
    };
  }

  private validateRequiredEnvVars(): void {
    const required = ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN', 'SLACK_SIGNING_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new ConfigurationError(
        `Missing required environment variables: ${missing.join(', ')}`,
        { missingVars: missing }
      );
    }

    // Validate numeric values
    const numericVars = [
      { key: 'PORT', defaultValue: '3000' },
      { key: 'AGENT_TIMEOUT', defaultValue: '30000' },
      { key: 'MAX_CONCURRENT_AGENTS', defaultValue: '10' },
    ];

    numericVars.forEach(({ key, defaultValue }) => {
      const value = process.env[key] || defaultValue;
      if (isNaN(parseInt(value, 10))) {
        throw new ConfigurationError(
          `Invalid numeric value for ${key}: ${value}`,
          { key, value }
        );
      }
    });
  }

  public isDevelopment(): boolean {
    return this._config.app.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this._config.app.nodeEnv === 'production';
  }
}

export const getConfig = (): GarvisConfig => {
  return ConfigManager.getInstance().config;
};