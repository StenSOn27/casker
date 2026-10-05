import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { BackupResultModel } from '../../../backup/infrastructure/persistance/entities/BackupResultModel.js';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'casker',
  synchronize: false,
  logging: false,
  entities: [BackupResultModel],
  migrations: ['src/backup/infrastructure/persistance/migrations/**/*{.ts,.js}'],
  subscribers: [],
});
