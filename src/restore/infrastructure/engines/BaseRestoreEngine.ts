import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { errorMessage } from '../../../shared/utils/ErrorMessage.js';
import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import { RestoreEngine } from '../../domain/interfaces/RestoreEngine.js';
import { RestoreFailedError } from '../../domain/errors/RestoreFailedError.js';

export abstract class BaseRestoreEngine<
  T extends DatabaseConnectionProps,
> extends RestoreEngine<T> {
  abstract buildRestoreCommandSpec(config: T, backupFilePath: string): CommandSpec;

  async restore(config: T, backupFilePath: string): Promise<void> {
    try {
      await this.executor.execute(this.buildRestoreCommandSpec(config, backupFilePath));
    } catch (err) {
      throw new RestoreFailedError(errorMessage(err));
    }
  }
}
