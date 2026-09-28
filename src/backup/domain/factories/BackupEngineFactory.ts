import type { BackupEngine } from '../interfaces/BackupEngine.js';

export abstract class BackupEngineFactory {
  abstract create(type: string, executionMode: string): Promise<BackupEngine>;
}
