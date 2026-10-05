import type { Hook } from '@oclif/core';
import { AppDataSource } from '../../../../backup/infrastructure/persistance/config/data-source.js';

const hook: Hook<'init'> = async function () {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
};

export default hook;
