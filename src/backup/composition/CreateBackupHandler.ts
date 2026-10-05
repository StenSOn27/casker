import { CreateBackupCommandHandler } from '../application/commands/CreateBackupCommandHandler.js';
import { BackupEngineFactoryImpl } from '../infrastructure/factories/BackupEngineFactoryImpl.js';
import { CommandExecutorFactoryImpl } from '../infrastructure/factories/CommandExecutorFactoryImpl.js';
import { BackupResultRepositoryImpl } from '../infrastructure/persistance/repositories/BackupResultRepositoryImpl.js';

export function createBackupHandler(): CreateBackupCommandHandler {
  const repository = new BackupResultRepositoryImpl();
  const engineFactory = new BackupEngineFactoryImpl();
  const executorFactory = new CommandExecutorFactoryImpl();

  return new CreateBackupCommandHandler(repository, engineFactory, executorFactory);
}
