import chalk from 'chalk';
import columnify from 'columnify';
import { Command, Flags, Interfaces } from '@oclif/core';
import { createListBackupHandler } from '../../../composition/CreateListBackupHandler.js';
import type {
  BackupListItem,
  ListBackupQuery,
} from '../../../application/queries/ListBackupQuery.js';
import type { DriverType, Status } from '../../../domain/entities/BackupResult.js';

export default class ListBackupCliCommand extends Command {
  static override description = 'Retrieve list of n last backup results';

  static override flags = {
    limit: Flags.integer({ char: 'l', default: 10, description: 'Max backups to show' }),
    all: Flags.boolean({ description: 'Show all backups' }),
    status: Flags.custom<Status>({ char: 's', description: 'Filter by status' })(),
    driver: Flags.custom<DriverType>({ char: 'd', description: 'Filter by driver' })(),
    json: Flags.boolean({ char: 'j', description: 'Output as JSON' }),
  };

  private formatSize(bytes: number): string {
    if (bytes < 1000) return `${bytes} B`;
    if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  private toRow(b: BackupListItem) {
    return {
      id: chalk.yellow(b.id.slice(0, 8)),
      status: b.status === 'failed' ? chalk.red(b.status) : chalk.green(b.status),
      size: b.status === 'failed' ? '-' : this.formatSize(b.sizeBytes),
      driver: b.driverType,
      created: b.createdAt.toUTCString(),
      database: b.name,
    };
  }

  private toQuery(
    flags: Interfaces.InferredFlags<typeof ListBackupCliCommand.flags>,
  ): ListBackupQuery {
    return {
      limit: flags.limit,
      status: flags.status,
      driver: flags.driver,
      all: flags.all,
    };
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListBackupCliCommand);
    const handler = createListBackupHandler();

    const backups = await handler.handle(this.toQuery(flags));

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
      if (b.errorMessage) output.push(chalk.red(`  error: ${b.errorMessage}`));
    });

    this.log(output.join('\n'));
  }
}
