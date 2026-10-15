export interface CommandSpec {
  bin: string;
  args: string[];
  env: object;
  stdoutFile?: string | undefined;
  stdinFile?: string | undefined;
}

export abstract class CommandExecutor {
  abstract execute(command: CommandSpec): Promise<void>;
}
