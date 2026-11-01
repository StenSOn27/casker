import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { ConnectionEngine } from '../interfaces/ConnectionEngine.js';

export abstract class ConnectionEngineFactory {
  abstract create(type: string, executor: CommandExecutor): Promise<ConnectionEngine>;
}
