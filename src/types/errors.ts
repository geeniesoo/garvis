export class GarvisError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GarvisError';
  }
}

export class AgentError extends GarvisError {
  constructor(
    message: string,
    public readonly agentName: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'AGENT_ERROR', { ...context, agentName });
    this.name = 'AgentError';
  }
}

export class SlackError extends GarvisError {
  constructor(
    message: string,
    public readonly slackErrorCode?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'SLACK_ERROR', { ...context, slackErrorCode });
    this.name = 'SlackError';
  }
}

export class ConfigurationError extends GarvisError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigurationError';
  }
}