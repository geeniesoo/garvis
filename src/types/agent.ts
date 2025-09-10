export interface AgentRequest {
  id: string;
  userId: string;
  channelId: string;
  content: string;
  context?: Record<string, unknown>;
  metadata?: {
    timestamp: Date;
    threadId?: string;
    mentions?: string[];
  };
}

export interface AgentResponse {
  requestId: string;
  status: 'success' | 'error' | 'partial';
  content: string;
  metadata?: {
    executionTime: number;
    agentUsed: string;
    attachments?: unknown[];
  };
  followUpActions?: AgentAction[];
}

export interface AgentAction {
  type: 'spawn_agent' | 'schedule_task' | 'send_dm' | 'update_status';
  payload: Record<string, unknown>;
}

export interface AgentConfig {
  name: string;
  enabled: boolean;
  maxConcurrentExecutions: number;
  timeout: number;
  retryAttempts: number;
  resources?: {
    memory: string;
    cpu: string;
  };
  environment?: Record<string, string>;
}

export interface IAgent {
  readonly name: string;
  readonly description: string;
  readonly capabilities: string[];

  canHandle(request: AgentRequest): boolean;
  execute(request: AgentRequest): Promise<AgentResponse>;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

export interface IAgentManager {
  registerAgent(agent: IAgent): void;
  getAgent(name: string): IAgent | undefined;
  getAllAgents(): IAgent[];
  findAgentForRequest(request: AgentRequest): IAgent | undefined;
  executeRequest(request: AgentRequest): Promise<AgentResponse>;
}