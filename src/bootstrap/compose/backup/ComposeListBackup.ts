import type {
  BackupListItem,
  ListBackupQuery,
} from '../../../backup/application/queries/ListBackupQuery.js';
import { ListBackupQueryHandler } from '../../../backup/application/queries/ListBackupQueryHandler.js';
import { BackupResultRepositoryImpl } from '../../../backup/infrastructure/persistance/repositories/BackupResultRepositoryImpl.js';
import type { QueryHandler } from '../../../shared/application/handlers/QueryHandler.js';

export function composeListBackupHandler(): QueryHandler<ListBackupQuery, BackupListItem[]> {
  const repository = new BackupResultRepositoryImpl();

  return new ListBackupQueryHandler(repository);
}
