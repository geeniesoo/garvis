# Garvis - Slack AI Assistant

A modular Slack-based AI assistant that spawns specialized agents to handle different types of tasks.

## Features

- 🤖 **Intelligent Task Routing** - Automatically routes requests to the most appropriate specialized agent
- 🔧 **Modular Architecture** - Easy to extend with new agents and capabilities  
- 💬 **Slack Integration** - Works with app mentions, direct messages, and slash commands
- 🛡️ **Type Safety** - Built with TypeScript for robust, maintainable code
- 📊 **Monitoring** - Built-in logging and agent performance tracking

## Specialized Agents

### 🔍 Information Retrieval Agent
- Answers questions and provides information
- Explains concepts and definitions
- Helps with research and lookups

### 📋 Task Manager Agent  
- Creates and manages todo lists
- Sets reminders and schedules
- Tracks task completion

### 💻 Code Helper Agent
- Code review and debugging assistance
- Programming language help
- Best practices and documentation guidance

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Slack workspace with bot permissions

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd garvis
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Slack credentials
   ```

3. **Configure your Slack app:**
   - Create a Slack app at https://api.slack.com/apps
   - Enable Socket Mode and get your App Token
   - Create a Bot Token with required scopes
   - Get your Signing Secret from Basic Information

4. **Required Slack Bot Scopes:**
   - `app_mentions:read`
   - `channels:history` 
   - `chat:write`
   - `commands`
   - `im:history`
   - `im:write`

### Development

```bash
# Start in development mode
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Slack Configuration (Required)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token  
SLACK_SIGNING_SECRET=your-signing-secret

# Application Settings
NODE_ENV=development
LOG_LEVEL=info
PORT=3000

# Agent Configuration
AGENT_TIMEOUT=30000
MAX_CONCURRENT_AGENTS=10
```

## Usage

### In Slack

**App Mentions:**
```
@garvis help me with my code
@garvis add task: Review pull requests
@garvis what is TypeScript?
```

**Direct Messages:**
```
help
add task: Call client tomorrow
debug this error: TypeError...
```

**Slash Commands:**
```
/garvis status
/garvis help
/garvis what is Docker?
```

**Special Commands:**
- `help` - Show available capabilities
- `status` - Display system status and metrics

## Architecture

### Core Components

- **GarvisBot** - Main Slack integration and event handling
- **AgentManager** - Lifecycle management for specialized agents
- **BaseAgent** - Abstract base class for all agents
- **Request Router** - Intelligent routing to appropriate agents

### Adding New Agents

1. Create a new agent class extending `BaseAgent`:
   ```typescript
   export class MyAgent extends BaseAgent {
     readonly name = 'MyAgent';
     readonly description = 'Description of capabilities';
     readonly capabilities = ['capability1', 'capability2'];
     
     canHandle(request: AgentRequest): boolean {
       // Logic to determine if this agent can handle the request
     }
     
     protected async executeInternal(request: AgentRequest): Promise<string> {
       // Implementation logic
     }
   }
   ```

2. Register the agent in `src/index.ts`:
   ```typescript
   agentManager.registerAgent(new MyAgent());
   ```

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines, coding standards, and architecture patterns.

## Project Structure

```
garvis/
├── src/
│   ├── agents/          # Specialized agent implementations
│   ├── core/           # Core bot and agent management
│   ├── types/          # TypeScript type definitions  
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── config/             # Configuration files
├── spec/              # Project specification
├── tests/             # Test suites
└── docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding guidelines
4. Add tests for new functionality
5. Ensure all tests pass and types check
6. Submit a pull request

## License

[License information here]