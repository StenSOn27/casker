import { join } from 'node:path';
import * as fs from 'node:fs/promises';
import { BackupEngine } from '../../domain/interfaces/BackupEngine.js';
import { BackupResult } from '../../domain/entities/BackupResult.js';
import type { CommandExecutor, CommandSpec } from '../../domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../domain/value-objects/ConnectionConfig.js';
import { errorMessage } from '../../../shared/utils/ErrorMessage.js';
import { BackupFailedError } from '../../domain/errors/BackupFailedError.js';

export abstract class BaseBackupEngine<T extends DatabaseConnectionProps> extends BackupEngine<T> {
  abstract buildBackupCommandSpec(config: T, filePath: string): CommandSpec;

  constructor(executor: CommandExecutor) {
    super(executor);
  }

  async backup(config: T, outputDir: string): Promise<BackupResult> {
    const fileName = this.buildBackupFileName(config.type, config.database, new Date());
    const filePath = join(outputDir, fileName);

    try {
      await this.executor.execute(this.buildBackupCommandSpec(config, filePath));
    } catch (err) {
      await fs.rm(filePath, { force: true });
      throw new BackupFailedError(errorMessage(err), filePath);
    }

    const stats = await fs.stat(filePath);
    const backupResult = BackupResult.create(
      config.type,
      filePath,
      stats.size,
      'success',
      config.database,
    );

    return backupResult;
  }
}
