import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { AgentManager } from '../agent-manager';
import { AgentRequest, GarvisConfig, SlackError } from '../../types';

export class GarvisBot {
  private app: App;
  private webClient: WebClient;
  private isStarted = false;

  constructor(
    private config: GarvisConfig,
    private agentManager: AgentManager,
    private logger: Logger
  ) {
    this.app = new App({
      token: config.slack.botToken,
      signingSecret: config.slack.signingSecret,
      appToken: config.slack.appToken,
      socketMode: true,
    });

    this.webClient = new WebClient(config.slack.botToken);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle app mentions (@garvis)
    this.app.event('app_mention', async ({ event, say }) => {
      try {
        await this.handleMessage(event.text || '', event.user || '', event.channel || '', say, event.thread_ts);
      } catch (error) {
        this.logger.error('Error handling app mention', { error, event });
        await say('Sorry, I encountered an error processing your request.');
      }
    });

    // Handle all messages in dedicated Garvis channels (no @mention needed)
    this.app.message(async ({ message, say }) => {
      // Only handle messages in channels with 'garvis' in the name, excluding bot messages
      if (message.channel_type === 'channel' && 
          'text' in message && 
          'user' in message && 
          !message.subtype) {
        
        // Get channel info to check if it's a Garvis channel
        try {
          const channelInfo = await this.app.client.conversations.info({
            channel: message.channel,
          });
          
          const channelName = channelInfo.channel?.name?.toLowerCase() || '';
          this.logger.info('Channel message received', {
            channel: message.channel,
            channelName,
            text: message.text,
            user: message.user
          });
          
          // Check if channel name contains 'garvis' (case insensitive)
          if (channelName.includes('garvis') || channelName.includes('ai')) {
            this.logger.info('Processing message in Garvis channel', { channelName });
            // Remove any @garvis mentions from the text to avoid duplicate handling
            const cleanText = message.text.replace(/<@[UW][A-Z0-9]+>/g, '').trim();
            if (cleanText) {
              await this.handleMessage(cleanText, message.user, message.channel, say);
            }
          } else {
            this.logger.info('Ignoring message - not a Garvis channel', { channelName });
          }
        } catch (error) {
          // Ignore errors from channel info lookup
          this.logger.debug('Could not get channel info', { error, channel: message.channel });
        }
      }
    });

    // Handle direct messages with dedicated WebClient
    this.app.message(async ({ message }) => {
      // Only handle direct messages in IM channels, excluding bot messages
      if (message.channel_type === 'im' && 
          'text' in message && 
          'user' in message && 
          !message.subtype) {
        try {
          const dmResponder = async (responseText: string) => {
            // Use dedicated WebClient with unique timestamp
            await this.webClient.chat.postMessage({
              channel: message.channel,
              text: responseText,
              unfurl_links: false,
              unfurl_media: false,
            });
          };
          
          await this.handleMessage(message.text, message.user, message.channel, dmResponder);
        } catch (error) {
          this.logger.error('Error handling direct message', { error, message });
          await this.webClient.chat.postMessage({
            channel: message.channel,
            text: 'Sorry, I encountered an error processing your request.',
          });
        }
      }
    });

    // Handle slash commands
    this.app.command('/garvis', async ({ command, ack, respond }) => {
      await ack();

      try {
        await this.handleMessage(
          command.text,
          command.user_id,
          command.channel_id,
          respond,
          undefined,
          true // isSlashCommand
        );
      } catch (error) {
        this.logger.error('Error handling slash command', { error, command });
        await respond('Sorry, I encountered an error processing your command.');
      }
    });

    // Handle help command
    this.setupHelpHandler();

    // Handle status command
    this.setupStatusHandler();

    // Error handling
    this.app.error(async (error) => {
      this.logger.error('Slack app error', { error: error.original });
    });
  }

  private async handleMessage(
    text: string,
    userId: string,
    channelId: string,
    respond: any,
    threadTs?: string,
    isSlashCommand = false
  ): Promise<void> {
    if (!text || text.trim() === '') {
      await respond('Please provide a message for me to help with.');
      return;
    }

    // Clean up the text (remove bot mention if present)
    const cleanText = text.replace(/<@[UW][A-Z0-9]+>/g, '').trim();

    if (cleanText === '') {
      await respond('Hi! How can I help you today?');
      return;
    }

    // Create agent request
    const request: AgentRequest = {
      id: uuidv4(),
      userId,
      channelId,
      content: cleanText,
      metadata: {
        timestamp: new Date(),
        ...(threadTs && { threadId: threadTs }),
      },
    };

    this.logger.info('Processing user request', {
      requestId: request.id,
      userId,
      channelId,
      contentLength: cleanText.length,
      isSlashCommand,
    });

    try {
      // Execute the request through the agent manager
      const response = await this.agentManager.executeRequest(request);

      // Prepare response text
      let responseText = response.content;

      // Add metadata for successful responses
      if (response.status === 'success' && response.metadata) {
        const executionTime = response.metadata.executionTime;
        const agentUsed = response.metadata.agentUsed;
        
        if (executionTime && agentUsed) {
          responseText += `\n\n_Processed by ${agentUsed} in ${executionTime}ms_`;
        }
      }

      // Send response - different handling for threaded vs DM
      if (threadTs && !isSlashCommand) {
        // For app mentions with threading
        await respond({
          text: responseText,
          thread_ts: threadTs,
        });
      } else {
        // For DMs and slash commands - pass as string
        await respond(responseText);
      }

      this.logger.info('Response sent successfully', {
        requestId: request.id,
        status: response.status,
        agentUsed: response.metadata?.agentUsed,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error processing request', {
        requestId: request.id,
        error: errorMessage,
      });

      await respond('I encountered an error processing your request. Please try again later.');
    }
  }

  private setupHelpHandler(): void {
    this.app.message('help', async ({ say }) => {
      const agents = this.agentManager.getAllAgents();
      const helpText = this.generateHelpText(agents);
      await say(helpText);
    });

    this.app.command('/garvis help', async ({ ack, respond }) => {
      await ack();
      const agents = this.agentManager.getAllAgents();
      const helpText = this.generateHelpText(agents);
      await respond(helpText);
    });
  }

  private setupStatusHandler(): void {
    this.app.message('status', async ({ say }) => {
      const statusText = this.generateStatusText();
      await say(statusText);
    });

    this.app.command('/garvis status', async ({ ack, respond }) => {
      await ack();
      const statusText = this.generateStatusText();
      await respond(statusText);
    });
  }

  private generateHelpText(agents: any[]): string {
    let helpText = `*Garvis AI Assistant* 🤖\n\n`;
    helpText += `I can help you with various tasks using specialized agents:\n\n`;

    agents.forEach((agent) => {
      helpText += `*${agent.name}*\n`;
      helpText += `${agent.description}\n`;
      helpText += `Capabilities: ${agent.capabilities.join(', ')}\n\n`;
    });

    helpText += `*How to use:*\n`;
    helpText += `• Mention me: @garvis <your request>\n`;
    helpText += `• Direct message: Just send me a message\n`;
    helpText += `• Slash command: /garvis <your request>\n\n`;
    helpText += `*Special commands:*\n`;
    helpText += `• help - Show this help message\n`;
    helpText += `• status - Show system status\n`;

    return helpText;
  }

  private generateStatusText(): string {
    const stats = this.agentManager.getAgentStats();
    const agentCount = Object.keys(stats).length;

    let statusText = `*Garvis System Status* 📊\n\n`;
    statusText += `Environment: ${this.config.app.nodeEnv}\n`;
    statusText += `Active Agents: ${agentCount}\n\n`;

    statusText += `*Agent Status:*\n`;
    Object.entries(stats).forEach(([name, stat]) => {
      statusText += `• ${name}: ${stat.executions} executions\n`;
    });

    statusText += `\nAll systems operational! 🟢`;

    return statusText;
  }

  public async start(): Promise<void> {
    if (this.isStarted) {
      this.logger.warn('Bot is already started');
      return;
    }

    try {
      // Initialize all agents first
      await this.agentManager.initializeAllAgents();

      // Start the Slack app
      await this.app.start();

      this.isStarted = true;
      this.logger.info('Garvis bot started successfully', {
        port: this.config.app.port,
        nodeEnv: this.config.app.nodeEnv,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to start bot', { error: errorMessage });
      throw new SlackError(`Failed to start bot: ${errorMessage}`);
    }
  }

  public async stop(): Promise<void> {
    if (!this.isStarted) {
      this.logger.warn('Bot is not started');
      return;
    }

    try {
      // Stop the Slack app
      await this.app.stop();

      // Cleanup all agents
      await this.agentManager.cleanupAllAgents();

      this.isStarted = false;
      this.logger.info('Garvis bot stopped successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error stopping bot', { error: errorMessage });
      throw new SlackError(`Failed to stop bot: ${errorMessage}`);
    }
  }

  public isRunning(): boolean {
    return this.isStarted;
  }
}