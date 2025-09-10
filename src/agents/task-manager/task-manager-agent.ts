import { BaseAgent } from '../../core/agent-manager';
import { AgentRequest } from '../../types';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export class TaskManagerAgent extends BaseAgent {
  readonly name = 'TaskManager';
  readonly description = 'Manages tasks, reminders, and todo lists';
  readonly capabilities = ['task-creation', 'task-management', 'reminders', 'todo-lists'];

  private tasks = new Map<string, Task[]>(); // userId -> tasks

  canHandle(request: AgentRequest): boolean {
    const keywords = [
      'task',
      'todo',
      'remind',
      'reminder',
      'schedule',
      'add task',
      'create task',
      'list tasks',
      'my tasks',
      'complete task',
      'done',
      'finish',
      'delete task',
      'remove task',
    ];

    return this.hasKeywords(request.content, keywords);
  }

  protected async executeInternal(request: AgentRequest): Promise<string> {
    const content = request.content.toLowerCase();
    const userId = request.userId;

    // Initialize user tasks if not exists
    if (!this.tasks.has(userId)) {
      this.tasks.set(userId, []);
    }

    const userTasks = this.tasks.get(userId)!;

    // Add task
    if (content.includes('add task') || content.includes('create task') || content.includes('new task')) {
      return this.handleAddTask(content, userId);
    }

    // List tasks
    if (content.includes('list tasks') || content.includes('my tasks') || content.includes('show tasks')) {
      return this.handleListTasks(userId);
    }

    // Complete task
    if (content.includes('complete') || content.includes('done') || content.includes('finish')) {
      return this.handleCompleteTask(content, userId);
    }

    // Delete task
    if (content.includes('delete') || content.includes('remove')) {
      return this.handleDeleteTask(content, userId);
    }

    // Help with task management
    if (content.includes('help') || content.includes('how to')) {
      return this.handleTaskHelp();
    }

    // Default task management response
    return this.handleGeneralTaskQuery(content, userId);
  }

  private handleAddTask(content: string, userId: string): string {
    // Extract task title (simple implementation)
    const taskMatch = content.match(/add task[:\s]+(.+)/i) || 
                     content.match(/create task[:\s]+(.+)/i) ||
                     content.match(/new task[:\s]+(.+)/i);

    if (!taskMatch || !taskMatch[1]) {
      return `I'd be happy to add a task for you! Please use the format:
"add task: [task description]"

For example:
• "add task: Review project proposal"
• "create task: Call client about meeting"
• "new task: Update documentation"`;
    }

    const taskTitle = taskMatch[1].trim();
    const task: Task = {
      id: this.generateId(),
      title: taskTitle,
      completed: false,
      createdAt: new Date(),
    };

    const userTasks = this.tasks.get(userId);
    if (!userTasks) {
      return 'Error: Could not access your tasks.';
    }
    userTasks.push(task);

    return `✅ Task added successfully!

**${task.title}**
Created: ${task.createdAt.toLocaleString()}
ID: ${task.id.slice(0, 8)}

You now have ${userTasks.length} task(s). Type "list tasks" to see all your tasks.`;
  }

  private handleListTasks(userId: string): string {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) {
      return 'Error: Could not access your tasks.';
    }

    if (userTasks.length === 0) {
      return `📋 You don't have any tasks yet!

To get started, try:
• "add task: [description]" - Create a new task
• "create task: [description]" - Same as above

Need help? Just ask "task help" for more options.`;
    }

    const pendingTasks = userTasks.filter(t => !t.completed);
    const completedTasks = userTasks.filter(t => t.completed);

    let response = `📋 **Your Tasks** (${userTasks.length} total)\n\n`;

    if (pendingTasks.length > 0) {
      response += `**📝 Pending (${pendingTasks.length}):**\n`;
      pendingTasks.forEach((task, index) => {
        response += `${index + 1}. **${task.title}**\n`;
        response += `   ID: ${task.id.slice(0, 8)} | Created: ${task.createdAt.toLocaleDateString()}\n\n`;
      });
    }

    if (completedTasks.length > 0) {
      response += `**✅ Completed (${completedTasks.length}):**\n`;
      completedTasks.forEach((task, index) => {
        response += `${index + 1}. ~~${task.title}~~\n`;
        response += `   ID: ${task.id.slice(0, 8)}\n\n`;
      });
    }

    response += `💡 *Tip: Use "complete [task ID]" or "delete [task ID]" to manage tasks*`;

    return response;
  }

  private handleCompleteTask(content: string, userId: string): string {
    const taskIdMatch = content.match(/complete\s+([a-f0-9]{8})/i) ||
                       content.match(/done\s+([a-f0-9]{8})/i) ||
                       content.match(/finish\s+([a-f0-9]{8})/i);

    if (!taskIdMatch || !taskIdMatch[1]) {
      return `To complete a task, please provide the task ID:
"complete [task ID]"

For example: "complete 1a2b3c4d"

Use "list tasks" to see all your task IDs.`;
    }

    const taskIdPrefix = taskIdMatch[1];
    const userTasks = this.tasks.get(userId);
    if (!userTasks) {
      return 'Error: Could not access your tasks.';
    }
    const task = userTasks.find(t => t.id.startsWith(taskIdPrefix));

    if (!task) {
      return `❌ Task not found with ID starting with "${taskIdPrefix}".

Use "list tasks" to see all your tasks and their IDs.`;
    }

    if (task.completed) {
      return `✅ Task "${task.title}" is already completed!`;
    }

    task.completed = true;

    return `🎉 Task completed!

**${task.title}**
Completed: ${new Date().toLocaleString()}

Great job! Type "list tasks" to see your remaining tasks.`;
  }

  private handleDeleteTask(content: string, userId: string): string {
    const taskIdMatch = content.match(/delete\s+([a-f0-9]{8})/i) ||
                       content.match(/remove\s+([a-f0-9]{8})/i);

    if (!taskIdMatch || !taskIdMatch[1]) {
      return `To delete a task, please provide the task ID:
"delete [task ID]"

For example: "delete 1a2b3c4d"

Use "list tasks" to see all your task IDs.`;
    }

    const taskIdPrefix = taskIdMatch[1];
    const userTasks = this.tasks.get(userId);
    if (!userTasks) {
      return 'Error: Could not access your tasks.';
    }
    const taskIndex = userTasks.findIndex(t => t.id.startsWith(taskIdPrefix));

    if (taskIndex === -1) {
      return `❌ Task not found with ID starting with "${taskIdPrefix}".

Use "list tasks" to see all your tasks and their IDs.`;
    }

    const deletedTask = userTasks.splice(taskIndex, 1)[0];
    if (!deletedTask) {
      return 'Error: Could not delete task.';
    }

    return `🗑️ Task deleted successfully!

**${deletedTask.title}**

You now have ${userTasks.length} task(s) remaining.`;
  }

  private handleTaskHelp(): string {
    return `📋 **Task Manager Help**

I can help you manage your tasks and stay organized! Here's what I can do:

**📝 Creating Tasks:**
• "add task: [description]" - Create a new task
• "create task: [description]" - Same as above
• "new task: [description]" - Also creates a task

**📋 Managing Tasks:**
• "list tasks" or "my tasks" - Show all your tasks
• "complete [task ID]" - Mark a task as done
• "delete [task ID]" - Remove a task permanently

**💡 Examples:**
• "add task: Review budget proposal"
• "list tasks"
• "complete 1a2b3c4d"
• "delete a1b2c3d4"

**📌 Tips:**
• Each task gets a unique 8-character ID
• Use the first 8 characters of the ID for commands
• Tasks are stored per user (your tasks are private)
• Completed tasks remain in your list until deleted

Need help with a specific task? Just ask!`;
  }

  private handleGeneralTaskQuery(content: string, userId: string): string {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) {
      return 'Error: Could not access your tasks.';
    }
    const pendingCount = userTasks.filter(t => !t.completed).length;

    return `📋 **Task Manager**

I can help you manage your tasks and stay organized!

**Your Current Status:**
• Total tasks: ${userTasks.length}
• Pending: ${pendingCount}
• Completed: ${userTasks.length - pendingCount}

**Quick Actions:**
• "add task: [description]" - Create new task
• "list tasks" - See all tasks
• "task help" - Get detailed help

What would you like to do with your tasks?`;
  }
}