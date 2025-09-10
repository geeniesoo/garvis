import { AgentManager } from '../agent-manager/agent-manager';
import { BaseAgent } from '../agent-manager/base-agent';
import { AgentRequest } from '../../types';
import winston from 'winston';

class TestAgent extends BaseAgent {
  readonly name = 'Test';
  readonly description = 'Test agent for unit tests';
  readonly capabilities = ['testing'];

  canHandle(request: AgentRequest): boolean {
    return request.content.includes('test');
  }

  protected async executeInternal(request: AgentRequest): Promise<string> {
    return `Test response for: ${request.content}`;
  }
}

describe('AgentManager', () => {
  let agentManager: AgentManager;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockLogger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })],
    });
    agentManager = new AgentManager(mockLogger, 5);
  });

  describe('registerAgent', () => {
    test('should register an agent successfully', () => {
      const agent = new TestAgent();
      agentManager.registerAgent(agent);

      const retrievedAgent = agentManager.getAgent('Test');
      expect(retrievedAgent).toBe(agent);
    });

    test('should return all registered agents', () => {
      const agent1 = new TestAgent();
      const agent2 = new TestAgent();
      
      agentManager.registerAgent(agent1);
      agentManager.registerAgent(agent2);

      const allAgents = agentManager.getAllAgents();
      expect(allAgents).toHaveLength(2);
    });
  });

  describe('findAgentForRequest', () => {
    test('should find appropriate agent for request', () => {
      const agent = new TestAgent();
      agentManager.registerAgent(agent);

      const request: AgentRequest = {
        id: '123',
        userId: 'user1',
        channelId: 'channel1',
        content: 'This is a test message',
      };

      const foundAgent = agentManager.findAgentForRequest(request);
      expect(foundAgent).toBe(agent);
    });

    test('should return undefined if no agent can handle request', () => {
      const agent = new TestAgent();
      agentManager.registerAgent(agent);

      const request: AgentRequest = {
        id: '123',
        userId: 'user1',
        channelId: 'channel1',
        content: 'This message has no test keyword',
      };

      const foundAgent = agentManager.findAgentForRequest(request);
      expect(foundAgent).toBeUndefined();
    });
  });

  describe('executeRequest', () => {
    test('should execute request with appropriate agent', async () => {
      const agent = new TestAgent();
      await agent.initialize();
      agentManager.registerAgent(agent);

      const request: AgentRequest = {
        id: '123',
        userId: 'user1',
        channelId: 'channel1',
        content: 'This is a test message',
      };

      const response = await agentManager.executeRequest(request);
      
      expect(response.status).toBe('success');
      expect(response.content).toBe('Test response for: This is a test message');
      expect(response.requestId).toBe('123');
      expect(response.metadata?.agentUsed).toBe('Test');
    });

    test('should return error if no agent found', async () => {
      const request: AgentRequest = {
        id: '123',
        userId: 'user1',
        channelId: 'channel1',
        content: 'No agent for this',
      };

      const response = await agentManager.executeRequest(request);
      
      expect(response.status).toBe('error');
      expect(response.content).toContain('No agent found');
    });
  });
});