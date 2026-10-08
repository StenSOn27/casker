import type {
  CommandExecutor,
  CommandSpec,
} from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { MySqlConnectionProps } from '../../domain/value-objects/ConnectionConfig.js';
import { BaseBackupEngine } from './BaseBackupEngine.js';

export class MySqlBackupEngine extends BaseBackupEngine<MySqlConnectionProps> {
  constructor(executor: CommandExecutor) {
    super(executor);
  }

  buildBackupCommandSpec(config: MySqlConnectionProps, filePath: string): CommandSpec {
    return {
      bin: 'mysql_dump',
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
