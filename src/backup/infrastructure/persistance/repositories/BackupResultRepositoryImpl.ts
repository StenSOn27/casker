import { BackupResult } from '../../../domain/entities/BackupResult.js';
import { BackupResultRepository } from '../../../domain/repositories/BackupResultRepository.js';
import { AppDataSource } from '../config/data-source.js';
import { BackupResultModel } from '../entities/BackupResultModel.js';
import { BackupResultMapper } from '../mappers/BackupResultMapper.js';

export class BackupResultRepositoryImpl extends BackupResultRepository {
  async create(result: BackupResult): Promise<string> {
    const resultOrm = BackupResultMapper.toOrm(result);
    await AppDataSource.manager.save(resultOrm);
    return resultOrm.id;
  }

  async getAll(): Promise<BackupResult[]> {
    const models = await AppDataSource.manager.find(BackupResultModel);
    return models.map((model) => BackupResultMapper.toDomain(model));
  }
}
