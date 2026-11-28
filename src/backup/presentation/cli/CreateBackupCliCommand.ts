import { Command, Constraints, Flags, Interfaces } from '@oclif/core';
import chalk from 'chalk';
import type { CreateBackupCommand } from '../../application/commands/CreateBackupCommand.js';
import type { ExecutionTarget } from '../../../shared/domain/factories/CommandExecutorFactory.js';
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
  outputDir: Flags.string({
    char: 'o',
    description: 'Output directory for the backup file',
    default: './backups',
  }),
};

type CreateBackupFlags = Interfaces.InferredFlags<typeof flags>;

export default abstract class CreateBackupCliCommand extends HandlerCliCommand<
  CreateBackupFlags,
  CreateBackupCommand,
  string
> {
  static override description =
    'Create a backup of the specified database connection and save it to the output directory';
  static override flags = flags;

  static constraints: (typeof Command)['constraints'] = [
    Constraints.flag('container')
      .is.dependentOn('execution')
      .when.thisIsTrue((flags): boolean => {
        return flags.execution === 'docker';
      }),
  ];

  protected async parseFlags(): Promise<CreateBackupFlags> {
    return (await this.parse(CreateBackupCliCommand)).flags;
  }

  protected toInput(flags: CreateBackupFlags): CreateBackupCommand {
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
      outputDir: flags.outputDir,
    };
  }

  protected onSuccess(backupId: string): void {
    console.log(chalk.green(`Backup created successfully! Backup ID: ${backupId}`));
  }
}
