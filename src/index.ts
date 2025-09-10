import { GarvisBot, AgentManager } from './core';
import { CodeHelperAgent, TaskManagerAgent, InfoRetrievalAgent } from './agents';
import { getConfig, logger } from './utils';
import { ConfigurationError } from './types';

async function startGarvis(): Promise<void> {
  try {
    // Load configuration
    const config = getConfig();
    logger.info('Starting Garvis AI Assistant', {
      environment: config.app.nodeEnv,
      logLevel: config.app.logLevel,
    });

    // Create agent manager
    const agentManager = new AgentManager(logger, config.agents.maxConcurrentAgents);

    // Register specialized agents
    agentManager.registerAgent(new InfoRetrievalAgent());
    agentManager.registerAgent(new TaskManagerAgent());
    agentManager.registerAgent(new CodeHelperAgent());

    logger.info('Agents registered successfully', {
      agentCount: agentManager.getAllAgents().length,
    });

    // Create and start bot
    const bot = new GarvisBot(config, agentManager, logger);
    await bot.start();

    logger.info('🤖 Garvis is now running!', {
      message: 'Ready to assist with your tasks',
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      try {
        await bot.stop();
        logger.info('Garvis shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    if (error instanceof ConfigurationError) {
      logger.error('Configuration error:', {
        message: error.message,
        context: error.context,
      });
    } else {
      logger.error('Failed to start Garvis:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    
    process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  process.exit(1);
});

// Start the application
if (require.main === module) {
  startGarvis().catch((error) => {
    console.error('Failed to start Garvis:', error);
    process.exit(1);
  });
}

export { startGarvis };