import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

import { UnsupportedDatabaseError } from '../../../shared/domain/errors/DatabaseErrors.js';
import { PostgresConnectionCommandBuilder } from '../builders/PostgresConnectionCommandBuilder.js';
import type { ConnectionCommandBuilder } from '../../domain/interfaces/ConnectionCommandBuilder.js';
import { ConnectionEngineFactory } from '../../domain/factories/ConnectionEngineFactory.js';
import type { DriverType } from '../../../backup/domain/entities/BackupResult.js';
import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { ConnectionEngine } from '../../domain/interfaces/ConnectionEngine.js';
import { ConnectionEngineImpl } from '../engines/ConnectionEngineImpl.js';

// @ts-expect-error TS2741: mysql engine is not implemented yet
const builders: Record<DriverType, ConnectionCommandBuilder<DatabaseConnectionProps>> = {
  postgresql: new PostgresConnectionCommandBuilder(),
  // mysql: new MySqlBackupCommandBuilder(),
};

export class ConnectionEngineFactoryImpl extends ConnectionEngineFactory {
  async create(type: DriverType, executor: CommandExecutor): Promise<ConnectionEngine> {
    const builder = builders[type];
    if (!builder) throw new UnsupportedDatabaseError(type);
    return new ConnectionEngineImpl(executor, builder);
  }
}
