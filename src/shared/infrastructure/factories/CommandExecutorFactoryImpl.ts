import type {
  CommandExecutorFactory,
  ExecutionTarget,
} from '../../domain/factories/CommandExecutorFactory.js';
import type { CommandExecutor } from '../../domain/interfaces/CommandExecutor.js';

import { DockerCommandExecutor } from '../config/executors/DockerCommandExecutor.js';
import { LocalCommandExecutor } from '../config/executors/LocalCommandExecutor.js';

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
