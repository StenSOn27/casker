import type { QueryHandler } from '../../../shared/application/handlers/QueryHandler.js';
import type { BackupResultRepository } from '../../domain/repositories/BackupResultRepository.js';
import type { BackupListItem, ListBackupQuery } from './ListBackupQuery.js';

export class ListBackupQueryHandler implements QueryHandler<ListBackupQuery, BackupListItem[]> {
  private repository: BackupResultRepository;

  constructor(repository: BackupResultRepository) {
    this.repository = repository;
  }

  async handle(query: ListBackupQuery): Promise<BackupListItem[]> {
    const backupResults = await this.repository.find(query.limit, query.status, query.driver);
    return backupResults.map((r) => ({
      id: r.getId(),
      driverType: r.getDriverType(),
      filePath: r.getFilePath(),
      sizeBytes: r.getSizeBytes(),
      status: r.getStatus(),
      name: r.getName(),
      createdAt: r.getCreatedAt(),
      errorMessage: r.getErrorMessage(),
    }));
  }
}
