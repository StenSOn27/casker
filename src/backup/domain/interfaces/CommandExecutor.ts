interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export abstract class CommandExecutor {
  abstract execute(command: string): Promise<CommandResult>;
}
