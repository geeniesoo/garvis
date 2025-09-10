import { IAgent, AgentRequest, AgentResponse, AgentError } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent implements IAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly capabilities: string[];

  protected isInitialized = false;
  protected executionCount = 0;

  abstract canHandle(request: AgentRequest): boolean;

  async execute(request: AgentRequest): Promise<AgentResponse> {
    if (!this.isInitialized) {
      throw new AgentError('Agent not initialized', this.name);
    }

    const startTime = Date.now();
    this.executionCount++;

    try {
      const result = await this.executeInternal(request);
      const executionTime = Date.now() - startTime;

      return {
        requestId: request.id,
        status: 'success',
        content: result,
        metadata: {
          executionTime,
          agentUsed: this.name,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        requestId: request.id,
        status: 'error',
        content: `Error in ${this.name}: ${errorMessage}`,
        metadata: {
          executionTime,
          agentUsed: this.name,
        },
      };
    }
  }

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
    this.executionCount = 0;
  }

  protected abstract executeInternal(request: AgentRequest): Promise<string>;

  protected generateId(): string {
    return uuidv4();
  }

  protected extractKeywords(content: string): string[] {
    return content
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  protected hasKeywords(content: string, keywords: string[]): boolean {
    const contentLower = content.toLowerCase();
    return keywords.some((keyword) => contentLower.includes(keyword));
  }
}