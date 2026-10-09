import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { RestoreEngine } from '../interfaces/RestoreEngine.js';

export abstract class RestoreEngineFactory {
  abstract create(type: string, executor: CommandExecutor): Promise<RestoreEngine>;
}
