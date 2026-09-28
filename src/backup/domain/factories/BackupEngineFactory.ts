import { CommandExecutorFactory } from './CommandExecutorFactory.js';
import type { BackupEngine } from '../interfaces/BackupEngine.js';

export abstract class BackupEngineFactory {
  abstract executorFactory: CommandExecutorFactory;
  abstract create(type: string): Promise<BackupEngine>;
}
