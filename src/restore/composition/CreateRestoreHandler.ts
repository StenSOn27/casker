import { CommandExecutorFactoryImpl } from '../../shared/infrastructure/factories/CommandExecutorFactoryImpl.js';
import { RestoreEngineFactoryImpl } from '../infrastructure/factories/RestoreEngineFactoryImpl.js';
import { RestoreCommandHandler } from '../application/commands/RestoreCommandHandler.js';

export function createRestoreHandler(): RestoreCommandHandler {
  const engineFactory = new RestoreEngineFactoryImpl();
  const executorFactory = new CommandExecutorFactoryImpl();

  return new RestoreCommandHandler(engineFactory, executorFactory);
}
