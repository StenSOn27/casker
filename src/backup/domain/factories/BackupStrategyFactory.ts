import { CommandExecutorFactory } from '../factories/CommandExecutorFactory.js';
import type { BackupStrategy } from '../interfaces/BackupStrategy.js';

export abstract class BackupStrategyFactory {
  abstract executorFactory: CommandExecutorFactory;
  abstract create(type: string): Promise<BackupStrategy>;
}
