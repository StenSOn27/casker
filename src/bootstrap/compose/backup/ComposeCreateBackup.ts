import { CreateBackupCommandHandler } from '../../../backup/application/commands/CreateBackupCommandHandler.js';
import { BackupEngineFactoryImpl } from '../../../backup/infrastructure/factories/BackupEngineFactoryImpl.js';
import { BackupResultRepositoryImpl } from '../../../backup/infrastructure/persistance/repositories/BackupResultRepositoryImpl.js';
import type { CommandHandler } from '../../../shared/application/handlers/CommandHandler.js';
import type { CommandExecutorFactory } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { CreateBackupCommand } from '../../../backup/application/commands/CreateBackupCommand.js';

export function composeCreateBackupHandler(
  executorFactory: CommandExecutorFactory,
): CommandHandler<CreateBackupCommand, string> {
  const repository = new BackupResultRepositoryImpl();
  const engineFactory = new BackupEngineFactoryImpl();

  return new CreateBackupCommandHandler(repository, engineFactory, executorFactory);
}
