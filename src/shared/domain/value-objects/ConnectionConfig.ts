import { ValueObject } from './ValueObject.js';
import type { ValueObjectProps } from './ValueObject.js';

export interface PostgresConnectionProps extends ValueObjectProps {
  type: 'postgresql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface MySqlConnectionProps extends ValueObjectProps {
  type: 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export type DatabaseConnectionProps = PostgresConnectionProps | MySqlConnectionProps;

export class DatabaseConnectionConfig extends ValueObject<DatabaseConnectionProps> {
  private constructor(props: DatabaseConnectionProps) {
    super(props);
  }

  static create(props: DatabaseConnectionProps): DatabaseConnectionConfig {
    if (!props.host.trim()) {
      throw new Error('Host cannot be empty');
    }
    if (props.port < 1 || props.port > 65535) {
      throw new Error('Invalid port number');
    }
    if (!props.database.trim()) {
      throw new Error('Database name cannot be empty');
    }
    return new DatabaseConnectionConfig(props);
  }
}
