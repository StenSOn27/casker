import type { RestoreCommand } from '../../../restore/application/commands/RestoreCommand.js';
import { RestoreCommandHandler } from '../../../restore/application/commands/RestoreCommandHandler.js';
import { RestoreEngineFactoryImpl } from '../../../restore/infrastructure/factories/RestoreEngineFactoryImpl.js';
import type { CommandHandler } from '../../../shared/application/handlers/CommandHandler.js';
import type { CommandExecutorFactory } from '../../../shared/domain/factories/CommandExecutorFactory.js';

export function composeRestoreHandler(
  executorFactory: CommandExecutorFactory,
): CommandHandler<RestoreCommand, void> {
  const engineFactory = new RestoreEngineFactoryImpl();

  return new RestoreCommandHandler(engineFactory, executorFactory);
}
