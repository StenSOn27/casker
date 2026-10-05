export abstract class QueryHandler<TQuery, TResult> {
  abstract handle(query: TQuery): Promise<TResult>;
}
