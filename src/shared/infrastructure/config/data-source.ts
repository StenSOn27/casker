import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { BackupResultModel } from '../../../backup/infrastructure/persistance/entities/BackupResultModel.js';
import path from 'node:path';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'casker',
  synchronize: false,
  logging: false,
  entities: [BackupResultModel],
  migrations: [
    path.join(import.meta.dirname, '../../../backup/infrastructure/persistance/migrations/*.js'),
  ],
  migrationsRun: true,
  subscribers: [],
});
