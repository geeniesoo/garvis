export interface GarvisConfig {
  slack: {
    botToken: string;
    appToken: string;
    signingSecret: string;
  };
  app: {
    nodeEnv: string;
    logLevel: string;
    port: number;
  };
  agents: {
    timeout: number;
    maxConcurrentAgents: number;
  };
}

export interface LogConfig {
  level: string;
  format: string;
  transports: string[];
}