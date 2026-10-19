import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { PostgresConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { RestoreCommandBuilder } from '../../domain/interfaces/RestoreCommandBuilder.js';

export class PostgresRestoreCommandBuilder implements RestoreCommandBuilder<PostgresConnectionProps> {
  buildRestoreCommandSpec(config: PostgresConnectionProps, filePath: string): CommandSpec {
    return {
      bin: 'pg_restore',
      args: [
        '-Fc',
        '-v',
        '-h',
        `${config.host}`,
        '-p',
        `${config.port}`,
        '-U',
        `${config.username}`,
        '-d',
        `${config.database}`,
        '--clean',
        '--if-exists',
      ],
      env: {},
      stdinFile: filePath,
    };
  }
}
