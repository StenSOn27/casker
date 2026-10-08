export interface CommandSpec {
  bin: string;
  args: string[];
  env: object;
  stdoutFile: string;
}

export abstract class CommandExecutor {
  abstract execute(command: CommandSpec): Promise<void>;
}
