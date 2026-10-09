import type { CommandSpec } from '../../../domain/interfaces/CommandExecutor.js';
import { BaseCommandExecutor } from './BaseCommandExecutor.js';

export class LocalCommandExecutor extends BaseCommandExecutor {
  async execute(command: CommandSpec): Promise<void> {
    await this.run(
      command.bin,
      command.args,
      { ...process.env, ...command.env },
      command.stdoutFile,
    );
  }
}
