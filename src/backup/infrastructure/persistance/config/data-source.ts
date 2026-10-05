import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { BackupResultModel } from '../entities/BackupResultModel.js';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'casker',
  synchronize: false,
  logging: true,
  entities: [BackupResultModel],
  migrations: ['src/backup/infrastructure/persistance/config/migrations/**/*{.ts,.js}'],
  subscribers: [],
});
