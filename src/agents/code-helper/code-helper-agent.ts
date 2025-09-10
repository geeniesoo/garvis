import { BaseAgent } from '../../core/agent-manager';
import { AgentRequest } from '../../types';

export class CodeHelperAgent extends BaseAgent {
  readonly name = 'CodeHelper';
  readonly description = 'Assists with code review, debugging, and programming questions';
  readonly capabilities = ['code-review', 'debugging', 'documentation', 'programming-help'];

  canHandle(request: AgentRequest): boolean {
    const keywords = [
      'code',
      'debug',
      'bug',
      'error',
      'function',
      'class',
      'variable',
      'javascript',
      'typescript',
      'python',
      'java',
      'react',
      'node',
      'npm',
      'git',
      'review',
      'refactor',
      'optimize',
      'algorithm',
      'documentation',
      'comment',
      'test',
      'testing',
      'unit test',
    ];

    return this.hasKeywords(request.content, keywords);
  }

  protected async executeInternal(request: AgentRequest): Promise<string> {
    const content = request.content.toLowerCase();

    // Code review requests
    if (content.includes('review') || content.includes('check my code')) {
      return this.handleCodeReview();
    }

    // Debugging help
    if (content.includes('debug') || content.includes('error') || content.includes('bug')) {
      return this.handleDebuggingHelp(content);
    }

    // Documentation help
    if (content.includes('document') || content.includes('comment')) {
      return this.handleDocumentationHelp();
    }

    // Testing help
    if (content.includes('test') || content.includes('testing')) {
      return this.handleTestingHelp();
    }

    // Git help
    if (content.includes('git') || content.includes('commit') || content.includes('branch')) {
      return this.handleGitHelp(content);
    }

    // Language-specific help
    if (content.includes('javascript') || content.includes('js')) {
      return this.handleJavaScriptHelp(content);
    }

    if (content.includes('typescript') || content.includes('ts')) {
      return this.handleTypeScriptHelp(content);
    }

    if (content.includes('react')) {
      return this.handleReactHelp(content);
    }

    if (content.includes('node') || content.includes('npm')) {
      return this.handleNodeHelp(content);
    }

    // General programming help
    return this.handleGeneralProgrammingHelp(request.content);
  }

  private handleCodeReview(): string {
    return `🔍 **Code Review Assistant**

I'd be happy to help review your code! Here's how I can assist:

**What to include for a good review:**
• Code snippet or file content
• Context about what the code should do
• Specific concerns or areas to focus on
• Programming language being used

**I can help with:**
• Code quality and best practices
• Performance optimizations
• Security considerations
• Readability improvements
• Bug identification
• Architecture suggestions

**Example request:**
"Review this JavaScript function for performance issues: [paste code]"

Please share your code and I'll provide detailed feedback!`;
  }

  private handleDebuggingHelp(content: string): string {
    if (content.includes('error message') || content.includes('stack trace')) {
      return `🐛 **Debugging Help - Error Analysis**

To help you debug effectively, please share:

**Essential Information:**
• The exact error message
• Stack trace (if available)
• Code that's causing the error
• What you expected vs. what happened
• Programming language/framework

**Common debugging steps:**
1. **Read the error message carefully** - it often tells you exactly what's wrong
2. **Check line numbers** - look at the specific line mentioned
3. **Verify variable types** - ensure data types match expectations
4. **Check syntax** - missing brackets, semicolons, etc.
5. **Test with simple inputs** - isolate the problem

**For specific errors:**
• Syntax errors → Check brackets, quotes, semicolons
• Type errors → Verify data types and conversions
• Reference errors → Check variable names and scope
• Network errors → Verify URLs and connectivity

Share your error details and I'll help you solve it!`;
    }

    return `🐛 **Debugging Assistant**

I can help you debug various programming issues:

**Common Issues I Help With:**
• Syntax errors and typos
• Logic errors in algorithms  
• Runtime errors and exceptions
• Performance problems
• Integration issues
• API and network problems

**To get the best help:**
1. Share the problematic code
2. Describe the expected behavior
3. Explain what's actually happening
4. Include any error messages
5. Mention the programming language

**Quick Debugging Tips:**
• Use console.log() or print() to trace values
• Check variable types and null values
• Verify API responses and data structure
• Test edge cases and boundary conditions

What specific debugging challenge are you facing?`;
  }

  private handleDocumentationHelp(): string {
    return `📝 **Documentation Helper**

I can help you create better code documentation:

**Types of Documentation:**
• **Inline Comments** - Explain complex logic
• **Function Documentation** - Parameters, return values, examples
• **API Documentation** - Endpoints, request/response formats
• **README Files** - Project setup and usage instructions
• **Code Comments** - Why not just what

**Best Practices:**
• Write clear, concise explanations
• Use consistent formatting (JSDoc, docstrings, etc.)
• Include examples for complex functions
• Keep documentation up-to-date with code changes
• Focus on "why" rather than "what"

**Documentation Formats:**
• **JavaScript/TypeScript**: JSDoc comments
• **Python**: Docstrings and type hints
• **Java**: Javadoc comments
• **Markdown**: README and wiki pages

**Example JSDoc:**
\`\`\`javascript
/**
 * Calculates the total price including tax
 * @param {number} price - Base price before tax
 * @param {number} taxRate - Tax rate as decimal (0.08 for 8%)
 * @returns {number} Total price including tax
 * @example
 * const total = calculateTotal(100, 0.08); // Returns 108
 */
\`\`\`

What kind of documentation do you need help with?`;
  }

  private handleTestingHelp(): string {
    return `🧪 **Testing Assistant**

I can help you with various testing approaches:

**Types of Testing:**
• **Unit Tests** - Test individual functions/components
• **Integration Tests** - Test component interactions
• **End-to-End Tests** - Test complete user workflows
• **API Tests** - Test backend endpoints
• **Performance Tests** - Test speed and load handling

**Popular Testing Frameworks:**
• **JavaScript**: Jest, Mocha, Cypress, Playwright
• **Python**: pytest, unittest, nose2
• **Java**: JUnit, TestNG, Mockito
• **TypeScript**: Same as JS + better type safety

**Testing Best Practices:**
• Write tests before or alongside code (TDD)
• Keep tests simple and focused
• Use descriptive test names
• Test both success and failure cases
• Mock external dependencies
• Aim for good coverage but focus on critical paths

**Example Jest Test:**
\`\`\`javascript
describe('Calculator', () => {
  test('should add two numbers correctly', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
});
\`\`\`

What testing challenge can I help you with?`;
  }

  private handleGitHelp(content: string): string {
    if (content.includes('commit')) {
      return `📋 **Git Commit Help**

**Good Commit Message Format:**
\`\`\`
type: short description

Longer explanation if needed
\`\`\`

**Common Types:**
• feat: new feature
• fix: bug fix  
• docs: documentation
• style: formatting
• refactor: code restructuring
• test: adding tests
• chore: maintenance

**Examples:**
• \`feat: add user authentication\`
• \`fix: resolve memory leak in data processor\`
• \`docs: update API documentation\`

**Best Practices:**
• Keep first line under 50 characters
• Use imperative mood ("add" not "added")
• Explain what and why, not how
• Reference issue numbers when applicable`;
    }

    return `🔧 **Git Help**

**Common Git Commands:**
\`\`\`bash
# Basic workflow
git status              # Check current state
git add .              # Stage changes
git commit -m "message" # Commit changes
git push               # Push to remote

# Branching
git branch feature-name # Create branch
git checkout feature-name # Switch branch
git merge feature-name  # Merge branch

# Viewing history
git log                # View commits
git diff               # See changes
\`\`\`

**Need help with a specific Git operation?**
• Creating/managing branches
• Resolving merge conflicts
• Undoing changes
• Working with remotes
• Rebasing vs merging

What Git challenge are you facing?`;
  }

  private handleJavaScriptHelp(content: string): string {
    return `🟨 **JavaScript Help**

**I can help with:**
• ES6+ features (arrow functions, async/await, destructuring)
• DOM manipulation and events
• Promises and async programming
• Array/Object methods
• Error handling
• Module systems (ES modules, CommonJS)
• Browser APIs and Node.js

**Common JavaScript Patterns:**
• Array methods: map, filter, reduce, forEach
• Promise handling with async/await
• Event handling and delegation
• Closures and scope management
• Prototype and class-based inheritance

**Performance Tips:**
• Use const/let instead of var
• Prefer async/await over callbacks
• Minimize DOM queries
• Use array methods for data transformation
• Avoid memory leaks with proper cleanup

**Example Modern JavaScript:**
\`\`\`javascript
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};
\`\`\`

What JavaScript concept can I help clarify?`;
  }

  private handleTypeScriptHelp(content: string): string {
    return `🔷 **TypeScript Help**

**TypeScript Benefits:**
• Static type checking
• Better IDE support and autocomplete
• Easier refactoring
• Self-documenting code
• Catch errors at compile time

**Key TypeScript Features:**
• Type annotations and inference
• Interfaces and type aliases
• Generics for reusable code
• Union and intersection types
• Enums and literals
• Decorators and advanced types

**Common TypeScript Patterns:**
\`\`\`typescript
// Interface definition
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // Optional property
}

// Generic function
function processArray<T>(items: T[]): T[] {
  return items.filter(item => item !== null);
}

// Union types
type Status = 'loading' | 'success' | 'error';
\`\`\`

**Configuration Tips:**
• Use strict mode in tsconfig.json
• Enable \`noImplicitAny\` for better type safety
• Use \`exactOptionalPropertyTypes\` for precision
• Configure path mapping for clean imports

What TypeScript feature do you need help with?`;
  }

  private handleReactHelp(content: string): string {
    return `⚛️ **React Help**

**React Concepts I Can Help With:**
• Components (functional vs class)
• Hooks (useState, useEffect, custom hooks)
• Props and state management
• Event handling
• Conditional rendering
• Lists and keys
• Forms and controlled components
• Context API and state management

**Modern React Patterns:**
\`\`\`jsx
// Functional component with hooks
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(userData => {
      setUser(userData);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
\`\`\`

**Best Practices:**
• Use functional components with hooks
• Keep components small and focused
• Lift state up when needed
• Use keys for list items
• Handle loading and error states
• Optimize with React.memo when needed

**State Management Options:**
• Built-in useState for local state
• Context API for app-wide state
• Redux Toolkit for complex state
• Zustand for simpler global state

What React challenge are you working on?`;
  }

  private handleNodeHelp(content: string): string {
    return `🟢 **Node.js Help**

**Node.js Core Concepts:**
• Event-driven, non-blocking I/O
• Modules and require/import system
• NPM package management
• Asynchronous programming
• File system operations
• HTTP servers and APIs
• Environment variables

**Common Node.js Tasks:**
\`\`\`javascript
// Express server
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

**NPM Commands:**
• \`npm init\` - Initialize project
• \`npm install package\` - Install dependency
• \`npm run script\` - Run package script
• \`npm audit\` - Check for vulnerabilities
• \`npm update\` - Update packages

**Best Practices:**
• Use environment variables for config
• Handle errors properly with try/catch
• Use middleware for common functionality
• Validate input data
• Log important events
• Use process managers like PM2 for production

What Node.js topic can I help with?`;
  }

  private handleGeneralProgrammingHelp(content: string): string {
    return `💻 **Programming Assistant**

I can help you with various programming challenges:

**Code Analysis & Review:**
• Code quality improvement
• Performance optimization
• Security best practices
• Architecture suggestions
• Refactoring guidance

**Debugging Support:**
• Error message interpretation
• Logic error identification
• Performance bottlenecks
• Testing strategies

**Best Practices:**
• Clean code principles
• SOLID design patterns
• Documentation standards
• Version control workflows
• Code organization

**Languages & Technologies:**
• JavaScript/TypeScript
• Node.js and React
• Python basics
• Git version control
• API design
• Database concepts

**To get the best help:**
1. Share your specific code or error
2. Explain what you're trying to achieve
3. Mention the programming language
4. Include any error messages
5. Describe what you've already tried

What programming challenge can I help you solve today?`;
  }
}