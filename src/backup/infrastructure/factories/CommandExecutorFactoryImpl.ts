import type { ExecutionTarget } from '../../application/commands/CreateBackupCommand.js';
import type { CommandExecutorFactory } from '../../domain/factories/CommandExecutorFactory.js';
import type { CommandExecutor } from '../../domain/interfaces/CommandExecutor.js';
import { DockerCommandExecutor } from '../executors/DockerCommandExecutor.js';
import { LocalCommandExecutor } from '../executors/LocalCommandExecutor.js';

export class CommandExecutorFactoryImpl implements CommandExecutorFactory {
  async create(execution: ExecutionTarget): Promise<CommandExecutor> {
    switch (execution.mode) {
      case 'local':
        return new LocalCommandExecutor();
      case 'docker':
        return new DockerCommandExecutor(execution.container);
    }
  }
}
