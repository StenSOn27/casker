import { Command, Constraints, Flags, Interfaces } from '@oclif/core';
import chalk from 'chalk';
import type { DriverType } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import type { ExecutionTarget } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { ConnectionCommand } from '../../application/commands/ConnectionCommand.js';
import { HandlerCliCommand } from '../../../shared/presentation/cli/HandlerCliCommand.js';

const flags = {
  type: Flags.custom<DriverType>({
    char: 't',
    description: 'Database type (e.g., postgresql, mysql)',
    required: true,
  })(),
  host: Flags.string({ char: 'h', description: 'Database host', required: true }),
  port: Flags.integer({ char: 'p', description: 'Database port', required: true }),
  username: Flags.string({ char: 'U', description: 'Database username', required: true }),
  password: Flags.string({ char: 'P', description: 'Database password', required: true }),
  database: Flags.string({ char: 'd', description: 'Database name', required: true }),
  execution: Flags.custom<ExecutionTarget['mode']>({
    char: 'e',
    description: 'Execution target (e.g., local, docker)',
    required: true,
  })(),
  container: Flags.string({
    char: 'c',
    description: 'Docker container name',
  }),
};

type ConnectionFlags = Interfaces.InferredFlags<typeof flags>;

export default abstract class ConnectionCliCommand extends HandlerCliCommand<
  ConnectionFlags,
  ConnectionCommand,
  void
> {
  static usage: string =
    'connection -t <value> -h <value> -p <value> -U <value> -P <value> -d <value> -e <value> [-c <value>]';
  static override description = 'Test connection to target database';
  static override flags = flags;

  static constraints: (typeof Command)['constraints'] = [
    Constraints.flag('container')
      .is.dependentOn('execution')
      .when.thisIsTrue((flags): boolean => {
        return flags.execution === 'docker';
      }),
  ];

  protected async parseFlags(): Promise<ConnectionFlags> {
    return (await this.parse(ConnectionCliCommand)).flags;
  }

  protected toInput(flags: ConnectionFlags): ConnectionCommand {
    return {
      connection: {
        type: flags.type,
        host: flags.host,
        port: flags.port,
        username: flags.username,
        password: flags.password,
        database: flags.database,
      },
      execution: {
        mode: flags.execution,
        container: flags.container!,
      },
    };
  }

  protected onSuccess(): void {
    console.log(chalk.green(`OK`));
  }
}
