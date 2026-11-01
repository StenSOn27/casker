import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { PostgresConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { ConnectionCommandBuilder } from '../../domain/interfaces/ConnectionCommandBuilder.js';

export class PostgresConnectionCommandBuilder implements ConnectionCommandBuilder<PostgresConnectionProps> {
  buildConnectionCommandSpec(config: PostgresConnectionProps): CommandSpec {
    return {
      bin: 'pg_isready',
      args: [
        '-q',
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
    };
  }
}

// # pg_isready -h localhost -p 5433 -U admin -d argus_dev
// # docker exec -i argus-db pg_isready -h localhost -p 5432 -U admin -d argus_dev
