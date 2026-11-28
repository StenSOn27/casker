import type { Handler } from './Handler.js';

export abstract class CommandHandler<TCommand, TResult> implements Handler<TCommand, TResult> {
  abstract handle(command: TCommand): Promise<TResult>;
}
