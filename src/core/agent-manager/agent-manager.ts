import { IAgent, IAgentManager, AgentRequest, AgentResponse, AgentError } from '../../types';
import { Logger } from 'winston';

export class AgentManager implements IAgentManager {
  private agents = new Map<string, IAgent>();
  private executionCounts = new Map<string, number>();

  constructor(private logger: Logger, private maxConcurrentAgents = 10) {}

  registerAgent(agent: IAgent): void {
    this.logger.info(`Registering agent: ${agent.name}`, {
      agentName: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
    });

    this.agents.set(agent.name, agent);
    this.executionCounts.set(agent.name, 0);
  }

  getAgent(name: string): IAgent | undefined {
    return this.agents.get(name);
  }

  getAllAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  findAgentForRequest(request: AgentRequest): IAgent | undefined {
    const availableAgents = Array.from(this.agents.values()).filter((agent) =>
      agent.canHandle(request)
    );

    if (availableAgents.length === 0) {
      return undefined;
    }

    // Return the first available agent that can handle the request
    // In the future, this could be enhanced with scoring/ranking logic
    return availableAgents[0];
  }

  async executeRequest(request: AgentRequest): Promise<AgentResponse> {
    const agent = this.findAgentForRequest(request);

    if (!agent) {
      return {
        requestId: request.id,
        status: 'error',
        content: 'No agent found to handle this request. Please try rephrasing your request or use /garvis help to see available capabilities.',
        metadata: {
          executionTime: 0,
          agentUsed: 'none',
        },
      };
    }

    const currentExecutions = this.executionCounts.get(agent.name) || 0;
    if (currentExecutions >= this.maxConcurrentAgents) {
      return {
        requestId: request.id,
        status: 'error',
        content: `Agent ${agent.name} is currently at maximum capacity. Please try again later.`,
        metadata: {
          executionTime: 0,
          agentUsed: agent.name,
        },
      };
    }

    this.executionCounts.set(agent.name, currentExecutions + 1);

    try {
      this.logger.info(`Executing request with agent: ${agent.name}`, {
        requestId: request.id,
        agentName: agent.name,
        userId: request.userId,
      });

      const response = await agent.execute(request);

      this.logger.info(`Request executed successfully`, {
        requestId: request.id,
        agentName: agent.name,
        executionTime: response.metadata?.executionTime,
        status: response.status,
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Agent execution failed`, {
        requestId: request.id,
        agentName: agent.name,
        error: errorMessage,
      });

      throw new AgentError(`Agent execution failed: ${errorMessage}`, agent.name, {
        requestId: request.id,
      });
    } finally {
      const newCount = (this.executionCounts.get(agent.name) || 1) - 1;
      this.executionCounts.set(agent.name, Math.max(0, newCount));
    }
  }

  async initializeAllAgents(): Promise<void> {
    this.logger.info('Initializing all agents');

    const initPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.initialize();
        this.logger.info(`Agent initialized: ${agent.name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to initialize agent: ${agent.name}`, { error: errorMessage });
        throw new AgentError(`Failed to initialize agent: ${errorMessage}`, agent.name);
      }
    });

    await Promise.all(initPromises);
    this.logger.info('All agents initialized successfully');
  }

  async cleanupAllAgents(): Promise<void> {
    this.logger.info('Cleaning up all agents');

    const cleanupPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.cleanup();
        this.logger.info(`Agent cleaned up: ${agent.name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to cleanup agent: ${agent.name}`, { error: errorMessage });
      }
    });

    await Promise.all(cleanupPromises);
    this.executionCounts.clear();
    this.logger.info('All agents cleaned up');
  }

  getAgentStats(): Record<string, { executions: number; capabilities: string[] }> {
    const stats: Record<string, { executions: number; capabilities: string[] }> = {};

    this.agents.forEach((agent, name) => {
      stats[name] = {
        executions: this.executionCounts.get(name) || 0,
        capabilities: agent.capabilities,
      };
    });

    return stats;
  }
}