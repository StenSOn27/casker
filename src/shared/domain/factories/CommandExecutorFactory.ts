import type { CommandExecutor } from '../interfaces/CommandExecutor.js';

export type ExecutionTarget = { mode: 'local' } | { mode: 'docker'; container: string };

export abstract class CommandExecutorFactory {
  abstract create(type: ExecutionTarget): Promise<CommandExecutor>;
}
