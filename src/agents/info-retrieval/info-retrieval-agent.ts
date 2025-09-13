import { BaseAgent } from '../../core/agent-manager';
import { AgentRequest } from '../../types';

export class InfoRetrievalAgent extends BaseAgent {
  readonly name = 'InfoRetrieval';
  readonly description = 'Provides information and answers questions about various topics';
  readonly capabilities = ['search', 'question-answering', 'definitions', 'explanations'];

  canHandle(request: AgentRequest): boolean {
    const keywords = [
      'what is',
      'what are',
      'explain',
      'define',
      'tell me about',
      'information about',
      'search for',
      'find',
      'lookup',
      'how does',
      'why',
      'when',
      'where',
      'help',
      'commands',
      'time',
      'date',
      'weather',
      'hello',
      'hi',
      'hey',
      'greetings',
      'good morning',
      'good afternoon',
      'good evening',
    ];

    return this.hasKeywords(request.content, keywords);
  }

  protected async executeInternal(request: AgentRequest): Promise<string> {
    const content = request.content.toLowerCase();

    // Handle greetings
    if (content.includes('hello') || content.includes('hi') || content.includes('hey') || 
        content.includes('greetings') || content.includes('good morning') || 
        content.includes('good afternoon') || content.includes('good evening')) {
      return `Hello! 👋 I'm Garvis, your AI assistant. I'm here to help you with information, questions, and various tasks.

You can:
• Ask me questions about topics
• Request information or explanations  
• Use /garvis commands
• Just chat with me naturally

What can I help you with today?`;
    }

    // Simple keyword-based responses for demonstration
    if (content.includes('what is garvis') || content.includes('about garvis')) {
      return `Garvis is a Slack-based AI assistant that can spawn specialized agents to handle different types of tasks. I'm designed to be modular and extensible, routing requests to the most appropriate agent for processing.

My key features:
• Intelligent task routing to specialized agents
• Natural language processing for user requests
• Slack integration with mentions, DMs, and slash commands
• Modular architecture for easy extension

How can I help you today?`;
    }

    if (content.includes('time') || content.includes('date')) {
      const now = new Date();
      return `The current date and time is: ${now.toLocaleString()}

Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    }

    if (content.includes('weather')) {
      return `I don't currently have access to real-time weather data, but I can help you with other information requests. 

To get weather information, you could:
• Check your local weather app
• Visit weather.com or weather.gov
• Ask me to help you set up weather alerts

Is there something else I can help you with?`;
    }

    if (content.includes('help') || content.includes('commands')) {
      return `Here are some ways to interact with me:

*Direct Questions:*
• "What is [topic]?" - Get information about a topic
• "Explain [concept]" - Get detailed explanations
• "Tell me about [subject]" - Learn about subjects

*Available Agents:*
• Info Retrieval (me) - Questions and information
• Task Manager - Todo lists and reminders
• Code Helper - Programming assistance

*Commands:*
• Type "help" for full agent capabilities
• Type "status" for system information

What would you like to know more about?`;
    }

    // Default response for information requests
    return `I'd be happy to help you find information about "${request.content}"!

However, I'm currently running in demonstration mode with limited knowledge access. In a full implementation, I would:

• Search relevant databases and APIs
• Access real-time information sources  
• Provide detailed, accurate answers
• Offer related topics and follow-up questions

For now, I can help you with:
• General questions about Garvis
• Current time and date
• System status and capabilities
• Routing to other specialized agents

Is there a specific aspect you'd like to explore, or would you like me to connect you with another agent?`;
  }
}