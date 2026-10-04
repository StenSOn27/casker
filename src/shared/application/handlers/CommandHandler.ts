export abstract class CommandHandler<TCommand, TResult> {
  abstract handle(command: TCommand): Promise<TResult>;
}
