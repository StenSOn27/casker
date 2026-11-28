import type { ExecutionTarget } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import { Command, Constraints, Flags, Interfaces } from '@oclif/core';
import chalk from 'chalk';
import type { RestoreCommand } from '../../application/commands/RestoreCommand.js';
import type { DriverType } from '../../../shared/domain/value-objects/ConnectionConfig.js';
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
  filepath: Flags.string({
    char: 'f',
    description: 'Backup file path',
    required: true,
  }),
};

type RestoreFlags = Interfaces.InferredFlags<typeof flags>;

export default abstract class RestoreCliCommand extends HandlerCliCommand<
  RestoreFlags,
  RestoreCommand,
  void
> {
  static usage: string =
    'restore -t <value> -h <value> -p <value> -U <value> -P <value> -d <value> -e <value> [-c <value>] -f <value>';
  static override description = 'Restore database from a backup file';
  static override flags = flags;

  static constraints: (typeof Command)['constraints'] = [
    Constraints.flag('container')
      .is.dependentOn('execution')
      .when.thisIsTrue((flags): boolean => {
        return flags.execution === 'docker';
      }),
  ];

  protected async parseFlags(): Promise<RestoreFlags> {
    return (await this.parse(RestoreCliCommand)).flags;
  }

  protected toInput(flags: RestoreFlags): RestoreCommand {
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
      backupFilePath: flags.filepath,
    };
  }

  protected onSuccess(): void {
    console.log(chalk.green(`Database restored successfully!`));
  }
}
