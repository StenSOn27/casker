import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import { BaseCommandExecutor } from './BaseCommandExecutor.js';

export class DockerCommandExecutor extends BaseCommandExecutor {
  constructor(private readonly containerName: string) {
    super();
    this.containerName = containerName;
  }
  async execute(command: CommandSpec): Promise<void> {
    await this.run(
      'docker',
      ['exec', this.containerName, command.bin, ...command.args],
      { ...process.env, ...command.env },
      command.stdoutFile,
    );
  }
}
