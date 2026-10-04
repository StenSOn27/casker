export abstract class QueryHandler {
  abstract handle<TCommand, TResult>(command: TCommand): Promise<TResult>;
}
