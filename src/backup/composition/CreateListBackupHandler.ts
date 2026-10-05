import { ListBackupQueryHandler } from '../application/queries/ListBackupQueryHandler.js';
import { BackupResultRepositoryImpl } from '../infrastructure/persistance/repositories/BackupResultRepositoryImpl.js';

export function createListBackupHandler(): ListBackupQueryHandler {
  const repository = new BackupResultRepositoryImpl();

  return new ListBackupQueryHandler(repository);
}
