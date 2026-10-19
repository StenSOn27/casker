import { join } from 'node:path';
import * as fs from 'node:fs/promises';
import { BackupResult } from '../../domain/entities/BackupResult.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import { errorMessage } from '../../../shared/utils/ErrorMessage.js';
import { BackupFailedError } from '../../domain/errors/BackupFailedError.js';
import { BackupEngine } from '../../domain/interfaces/BackupEngine.js';

export abstract class BackupEngineImpl<T extends DatabaseConnectionProps> extends BackupEngine<T> {
  async backup(config: T, outputDir: string): Promise<BackupResult> {
    const fileName = this.buildBackupFileName(config.type, config.database, new Date());
    const filePath = join(outputDir, fileName);

    try {
      const commandSpec = this.builder.buildBackupCommandSpec(config, filePath);
      await this.executor.execute(commandSpec);
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
