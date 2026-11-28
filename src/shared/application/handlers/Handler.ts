export interface Handler<TInput, TResult> {
  handle(input: TInput): Promise<TResult>;
}
