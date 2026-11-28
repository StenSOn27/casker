import { ConnectionEngineFactoryImpl } from '../../../connection/infrastructure/factories/ConnectionEngineFactoryImpl.js';
import { ConnectionCommandHandler } from '../../../connection/application/commands/ConnectionCommandHandler.js';
import type { CommandHandler } from '../../../shared/application/handlers/CommandHandler.js';
import type { CommandExecutorFactory } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { ConnectionCommand } from '../../../connection/application/commands/ConnectionCommand.js';

export function composeConnectionHandler(
  executorFactory: CommandExecutorFactory,
): CommandHandler<ConnectionCommand, void> {
  const engineFactory = new ConnectionEngineFactoryImpl();

  return new ConnectionCommandHandler(engineFactory, executorFactory);
}
