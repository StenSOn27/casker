import { PostgresBackupEngine } from '../engines/PostgresBackupEngine.js';
import type { DriverType } from '../../domain/entities/BackupResult.js';
import type { BackupEngine } from '../../domain/interfaces/BackupEngine.js';
import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import { BackupEngineFactory } from '../../domain/factories/BackupEngineFactory.js';

type BackupEngineConstructor = new (executor: CommandExecutor) => BackupEngine;

// @ts-expect-error TS2741: mysql engine is not implemented yet
export const engines: Record<DriverType, BackupEngineConstructor> = {
  postgresql: PostgresBackupEngine,
  // mysql: MySqlBackupEngine,
};

export class BackupEngineFactoryImpl extends BackupEngineFactory {
  async create(type: DriverType, executor: CommandExecutor): Promise<BackupEngine> {
    const engine = this.getEngineClass(type);
    return new engine(executor);
  }

  private getEngineClass(type: DriverType): BackupEngineConstructor {
    return engines[type];
  }
}
