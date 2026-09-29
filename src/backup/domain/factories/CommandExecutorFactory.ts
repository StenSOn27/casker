import type { ExecutionTarget } from '../../application/commands/CreateBackupCommand.js';
import type { CommandExecutor } from '../interfaces/CommandExecutor.js';

export abstract class CommandExecutorFactory {
  abstract create(type: ExecutionTarget): Promise<CommandExecutor>;
}
