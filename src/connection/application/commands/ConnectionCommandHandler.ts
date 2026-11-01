import type { CommandHandler } from '../../../shared/application/handlers/CommandHandler.js';
import type { CommandExecutorFactory } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { ConnectionEngineFactory } from '../../domain/factories/ConnectionEngineFactory.js';
import type { ConnectionCommand } from './ConnectionCommand.js';

export class ConnectionCommandHandler implements CommandHandler<ConnectionCommand, void> {
  private engineFactory: ConnectionEngineFactory;
  private executorFactory: CommandExecutorFactory;

  constructor(engineFactory: ConnectionEngineFactory, executorFactory: CommandExecutorFactory) {
    this.engineFactory = engineFactory;
    this.executorFactory = executorFactory;
  }

  async handle(command: ConnectionCommand): Promise<void> {
    const executor = await this.executorFactory.create(command.execution);
    const connectionEngine = await this.engineFactory.create(command.connection.type, executor);
    await connectionEngine.connection(command.connection);
  }
}
