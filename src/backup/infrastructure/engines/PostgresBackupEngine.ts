import type {
  CommandExecutor,
  CommandSpec,
} from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { PostgresConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { BaseBackupEngine } from './BaseBackupEngine.js';

export class PostgresBackupEngine extends BaseBackupEngine<PostgresConnectionProps> {
  constructor(executor: CommandExecutor) {
    super(executor);
  }

  buildBackupCommandSpec(config: PostgresConnectionProps, filePath: string): CommandSpec {
    return {
      bin: 'pg_dump',
      args: [
        '-h',
        `${config.host}`,
        '-p',
        `${config.port}`,
        '-U',
        `${config.username}`,
        '-d',
        `${config.database}`,
      ],
      env: {},
      stdoutFile: filePath,
    };
  }
}
