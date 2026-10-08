import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { BackupEngine } from '../interfaces/RestoreEngine.js';

export abstract class BackupEngineFactory {
  abstract create(type: string, executor: CommandExecutor): Promise<BackupEngine>;
}
