import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { BackupResultModel } from '../../../backup/infrastructure/persistance/entities/BackupResultModel.js';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import envPaths from 'env-paths';

const dataDir = envPaths('casker', { suffix: '' }).data;
mkdirSync(dataDir, { recursive: true });

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: path.join(dataDir, 'casker'),
  synchronize: false,
  logging: false,
  entities: [BackupResultModel],
  migrations: [
    path.join(import.meta.dirname, '../../../backup/infrastructure/persistance/migrations/*.js'),
  ],
  migrationsRun: true,
  subscribers: [],
});
