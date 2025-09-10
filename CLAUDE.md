# Garvis Project Configuration

## Project Overview

Garvis is a Slack-based AI assistant that spawns specialized agents for different tasks. The architecture is modular and extensible, focusing on intelligent task routing and agent lifecycle management.

## Development Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run typecheck    # Run TypeScript compiler checks
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode

# After making changes, always run:
npm run lint && npm run typecheck
```

## Architecture Guidelines

### Core Principles
- **Modular Design**: Each agent is a separate, self-contained module
- **Interface-Driven**: All agents implement the `IAgent` interface
- **Async/Await**: Use async/await for all asynchronous operations
- **Error Handling**: Comprehensive error handling with structured logging
- **Type Safety**: Strict TypeScript with proper type definitions

### Project Structure
Follow the structure defined in `spec/GARVIS_SPEC.md`:
- `/src/agents` - Specialized agent implementations
- `/src/core` - Core Garvis functionality (bot, agent-manager, router)
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/config` - Configuration files

## Coding Standards

### TypeScript
- Use strict mode (`"strict": true`)
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for public methods
- Avoid `any` - use proper typing or `unknown`

### Naming Conventions
- Classes: PascalCase (e.g., `CodeHelperAgent`)
- Files: kebab-case (e.g., `code-helper-agent.ts`)
- Interfaces: PascalCase with `I` prefix (e.g., `IAgent`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_AGENTS`)

### Error Handling
- Use custom error classes that extend `Error`
- Always log errors with structured data
- Graceful degradation - don't crash the bot
- Return meaningful error responses to users

### Logging
- Use structured JSON logging
- Include request IDs for traceability
- Log at appropriate levels (debug, info, warn, error)
- Never log sensitive information (tokens, user data)

## Testing Approach

### Test Structure
- Unit tests for individual components
- Integration tests for Slack interactions
- Mock external services (Slack API, third-party APIs)
- Test both success and error scenarios

### Test Files
- Place tests in `__tests__` directories next to source files
- Name test files with `.test.ts` suffix
- Use descriptive test names that explain the scenario

## Slack Integration Guidelines

### Message Handling
- Always respond to user interactions (even if just acknowledgment)
- Use threaded responses to keep channels organized
- Handle rate limiting gracefully
- Sanitize user input before processing

### Bot Behavior
- Be helpful but not verbose in Slack responses
- Use rich formatting (blocks, attachments) when appropriate
- Provide clear error messages to users
- Support both mentions and DMs

## Agent Development

### Creating New Agents
1. Implement the `IAgent` interface
2. Add comprehensive error handling
3. Include proper TypeScript types
4. Write unit tests
5. Update agent registry
6. Add to documentation

### Agent Best Practices
- Keep agents focused on single responsibilities
- Make agents stateless when possible
- Handle timeouts and cancellation
- Provide clear capability descriptions

## Environment Configuration

### Required Environment Variables
```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_SIGNING_SECRET=...
NODE_ENV=development
LOG_LEVEL=info
```

### Development Setup
- Use `.env.example` as template
- Never commit actual secrets to repository
- Validate required environment variables on startup

## Code Quality Checks

Before considering any implementation complete:
1. All TypeScript compilation passes without errors
2. ESLint passes without warnings
3. All tests pass
4. No console.log statements in production code
5. Proper error handling implemented

## Performance Considerations

- Implement request timeouts for all external calls
- Use connection pooling for database/external services
- Monitor memory usage with multiple concurrent agents
- Implement graceful shutdown handling

## Security Guidelines

- Validate and sanitize all user inputs
- Use environment variables for all secrets
- Implement rate limiting
- Log security-relevant events
- Never expose internal error details to users