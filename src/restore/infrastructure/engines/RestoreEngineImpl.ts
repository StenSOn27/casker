import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { errorMessage } from '../../../shared/utils/ErrorMessage.js';
import { RestoreEngine } from '../../domain/interfaces/RestoreEngine.js';
import { RestoreFailedError } from '../../domain/errors/RestoreFailedError.js';

export class RestoreEngineImpl<T extends DatabaseConnectionProps> extends RestoreEngine<T> {
  async restore(config: T, backupFilePath: string): Promise<void> {
    try {
      await this.executor.execute(this.builder.buildRestoreCommandSpec(config, backupFilePath));
    } catch (err) {
      throw new RestoreFailedError(errorMessage(err));
    }
  }
}
