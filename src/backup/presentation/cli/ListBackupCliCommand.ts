import chalk from 'chalk';
import columnify from 'columnify';
import { Flags, Interfaces } from '@oclif/core';
import type { BackupListItem, ListBackupQuery } from '../../application/queries/ListBackupQuery.js';
import type { Status } from '../../domain/entities/BackupResult.js';
import type { DriverType } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { HandlerCliCommand } from '../../../shared/presentation/cli/HandlerCliCommand.js';

const flags = {
  limit: Flags.integer({ char: 'l', default: 10, description: 'Max backups to show' }),
  all: Flags.boolean({ description: 'Show all backups' }),
  status: Flags.custom<Status>({ char: 's', description: 'Filter by status' })(),
  driver: Flags.custom<DriverType>({ char: 'd', description: 'Filter by driver' })(),
  json: Flags.boolean({ char: 'j', description: 'Output as JSON' }),
};

type ListBackupFlags = Interfaces.InferredFlags<typeof flags>;

export default abstract class ListBackupCliCommand extends HandlerCliCommand<
  ListBackupFlags,
  ListBackupQuery,
  BackupListItem[]
> {
  static override description = 'Retrieve list of n last backup results';
  static override flags = flags;

  private formatSize(bytes: number): string {
    if (bytes < 1000) return `${bytes} B`;
    if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  private toRow(b: BackupListItem) {
    return {
      id: chalk.yellowBright(b.id.slice(0, 8)),
      status:
        b.status === 'failed' ? chalk.magentaBright.bold(b.status) : chalk.green.bold(b.status),
      size: this.formatSize(b.sizeBytes),
      driver: b.driverType,
      created: chalk.dim(b.createdAt.toUTCString()),
      database: b.name,
    };
  }

  protected async parseFlags(): Promise<ListBackupFlags> {
    return (await this.parse(ListBackupCliCommand)).flags;
  }

  protected toInput(flags: ListBackupFlags): ListBackupQuery {
    return {
      limit: flags.limit,
      status: flags.status,
      driver: flags.driver,
      all: flags.all,
    };
  }

  protected onSuccess(backups: BackupListItem[], flags: ListBackupFlags): void {
    if (flags.json) {
      console.log(JSON.stringify(backups, null, 2));
      return;
    }

    if (backups.length === 0) {
      console.log(chalk.red('No backups found.'));
      return;
    }

    const lines = columnify(
      backups.map((b) => this.toRow(b)),
      {
        showHeaders: false,
        columnSplitter: '  ',
      },
    ).split('\n');

    const output: string[] = [];
    backups.forEach((b, i) => {
      output.push(lines[i]!);
      if (b.errorMessage) output.push('  ' + chalk.underline.red.dim(`error: ${b.errorMessage}\n`));
    });

    this.log(output.join('\n'));
  }
}
