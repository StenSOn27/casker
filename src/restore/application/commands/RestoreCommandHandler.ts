import type { CommandHandler } from '../../../shared/application/handlers/CommandHandler.js';
import type { CommandExecutorFactory } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { RestoreEngineFactory } from '../../domain/factories/RestoreEngineFactory.js';
import type { RestoreCommand } from './RestoreCommand.js';

export class RestoreCommandHandler implements CommandHandler<RestoreCommand, void> {
  private engineFactory: RestoreEngineFactory;
  private executorFactory: CommandExecutorFactory;

  constructor(engineFactory: RestoreEngineFactory, executorFactory: CommandExecutorFactory) {
    this.engineFactory = engineFactory;
    this.executorFactory = executorFactory;
  }

  async handle(command: RestoreCommand): Promise<void> {
    const executor = await this.executorFactory.create(command.execution);
    const restoreEngine = await this.engineFactory.create(command.connection.type, executor);
    await restoreEngine.restore(command.connection, command.backupFilePath);
  }
}
