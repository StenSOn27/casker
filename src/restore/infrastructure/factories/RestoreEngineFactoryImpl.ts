import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import type { RestoreEngineFactory } from '../../domain/factories/RestoreEngineFactory.js';
import type { RestoreEngine } from '../../domain/interfaces/RestoreEngine.js';
import { PostgresRestoreEngine } from '../engines/PostgresRestoreEngine.js';

export type DriverType = DatabaseConnectionProps['type'];

type RestoreEngineConstructor = new (executor: CommandExecutor) => RestoreEngine;

// @ts-expect-error TS2741: mysql engine is not implemented yet
export const engines: Record<DriverType, RestoreEngineConstructor> = {
  postgresql: PostgresRestoreEngine,
  // mysql: MySqlRestoreEngine,
};

export class RestoreEngineFactoryImpl implements RestoreEngineFactory {
  async create(type: DriverType, executor: CommandExecutor): Promise<RestoreEngine> {
    const engine = this.getEngineClass(type);
    return new engine(executor);
  }

  private getEngineClass(type: DriverType): RestoreEngineConstructor {
    return engines[type];
  }
}
