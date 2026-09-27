export abstract class CommandExecutor {
  abstract execute(command: string): Promise<void>;
}
