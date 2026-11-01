import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import type { ConnectionCommandBuilder } from './ConnectionCommandBuilder.js';

export abstract class ConnectionEngine<
  T extends DatabaseConnectionProps = DatabaseConnectionProps,
> {
  constructor(
    protected executor: CommandExecutor,
    protected builder: ConnectionCommandBuilder<T>,
  ) {}

  abstract connection(config: T): Promise<void>;
}
