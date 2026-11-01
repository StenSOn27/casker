import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { errorMessage } from '../../../shared/utils/ErrorMessage.js';
import { ConnectionEngine } from '../../domain/interfaces/ConnectionEngine.js';
import { ConnectionFailedError } from '../../domain/errors/ConnectionFailedError.js';

export class ConnectionEngineImpl<T extends DatabaseConnectionProps> extends ConnectionEngine<T> {
  async connection(config: T): Promise<void> {
    try {
      await this.executor.execute(this.builder.buildConnectionCommandSpec(config));
    } catch (err) {
      throw new ConnectionFailedError(errorMessage(err));
    }
  }
}
