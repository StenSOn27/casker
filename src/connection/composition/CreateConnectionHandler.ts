import { CommandExecutorFactoryImpl } from '../../shared/infrastructure/factories/CommandExecutorFactoryImpl.js';
import { ConnectionEngineFactoryImpl } from '../infrastructure/factories/ConnectionEngineFactoryImpl.js';
import { ConnectionCommandHandler } from '../application/commands/ConnectionCommandHandler.js';

export function createConnectionHandler(): ConnectionCommandHandler {
  const engineFactory = new ConnectionEngineFactoryImpl();
  const executorFactory = new CommandExecutorFactoryImpl();

  return new ConnectionCommandHandler(engineFactory, executorFactory);
}
