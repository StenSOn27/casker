import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import type { RestoreCommandBuilder } from './RestoreCommandBuilder.js';

export abstract class RestoreEngine<T extends DatabaseConnectionProps = DatabaseConnectionProps> {
  constructor(
    protected executor: CommandExecutor,
    protected builder: RestoreCommandBuilder<T>,
  ) {}

  abstract restore(config: T, backupFilePath: string): Promise<void>;
}
