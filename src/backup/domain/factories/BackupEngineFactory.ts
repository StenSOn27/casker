import type { BackupEngine } from '../interfaces/BackupEngine.js';
import type { CommandExecutor } from '../interfaces/CommandExecutor.js';

export abstract class BackupEngineFactory {
  abstract create(type: string, executor: CommandExecutor): Promise<BackupEngine>;
}
