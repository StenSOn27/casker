import type { Handler } from './Handler.js';

export abstract class QueryHandler<TQuery, TResult> implements Handler<TQuery, TResult> {
  abstract handle(query: TQuery): Promise<TResult>;
}
