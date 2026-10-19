import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

import { UnsupportedDatabaseError } from '../../../shared/domain/errors/DatabaseErrors.js';
import { PostgresRestoreCommandBuilder } from '../builders/PostgresRestoreCommandBuilder.js';
import type { RestoreCommandBuilder } from '../../domain/interfaces/RestoreCommandBuilder.js';
import { RestoreEngineFactory } from '../../domain/factories/RestoreEngineFactory.js';
import type { DriverType } from '../../../backup/domain/entities/BackupResult.js';
import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { RestoreEngine } from '../../domain/interfaces/RestoreEngine.js';
import { RestoreEngineImpl } from '../engines/RestoreEngineImpl.js';

// @ts-expect-error TS2741: mysql engine is not implemented yet
const builders: Record<DriverType, RestoreCommandBuilder<DatabaseConnectionProps>> = {
  postgresql: new PostgresRestoreCommandBuilder(),
  // mysql: new MySqlBackupCommandBuilder(),
};

export class RestoreEngineFactoryImpl extends RestoreEngineFactory {
  async create(type: DriverType, executor: CommandExecutor): Promise<RestoreEngine> {
    const builder = builders[type];
    if (!builder) throw new UnsupportedDatabaseError(type);
    return new RestoreEngineImpl(executor, builder);
  }
}
