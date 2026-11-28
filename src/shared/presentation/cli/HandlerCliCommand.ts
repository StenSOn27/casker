import { Command } from '@oclif/core';
import type { Handler } from '../../application/handlers/Handler.js';

export abstract class HandlerCliCommand<TFlags, TInput, TResult> extends Command {
  protected abstract parseFlags(): Promise<TFlags>;
  protected abstract toInput(flags: TFlags): TInput;
  protected abstract createHandler(): Handler<TInput, TResult>;
  protected abstract onSuccess(result: TResult, flags: TFlags): void;

  async run(): Promise<void> {
    const flags = await this.parseFlags();
    const result = await this.createHandler().handle(this.toInput(flags));
    this.onSuccess(result, flags);
  }
}
