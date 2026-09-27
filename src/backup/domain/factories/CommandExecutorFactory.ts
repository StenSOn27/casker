import type { CommandExecutor } from '../interfaces/CommandExecutor.js';

export abstract class CommandExecutorFactory {
  abstract create(type: string): Promise<CommandExecutor>;
}
