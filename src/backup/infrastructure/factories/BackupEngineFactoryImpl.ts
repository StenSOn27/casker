import type { DriverType } from '../../domain/entities/BackupResult.js';
import type { BackupEngine } from '../../domain/interfaces/BackupEngine.js';
import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import { BackupEngineFactory } from '../../domain/factories/BackupEngineFactory.js';
import { PostgresBackupCommandBuilder } from '../builders/PostgresBackupCommandBuilder.js';
import type { BackupCommandBuilder } from '../../domain/interfaces/BackupCommandBuilder.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { BackupEngineImpl } from '../engines/BackupEngineImpl.js';
import { UnsupportedDatabaseError } from '../../../shared/domain/errors/DatabaseErrors.js';

// @ts-expect-error TS2741: mysql engine is not implemented yet
const builders: Record<DriverType, BackupCommandBuilder<DatabaseConnectionProps>> = {
  postgresql: new PostgresBackupCommandBuilder(),
  // mysql: new MySqlBackupCommandBuilder(),
};

export class BackupEngineFactoryImpl extends BackupEngineFactory {
  async create(type: DriverType, executor: CommandExecutor): Promise<BackupEngine> {
    const builder = builders[type];
    if (!builder) throw new UnsupportedDatabaseError(type);
    return new BackupEngineImpl(executor, builder);
  }
}
