import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { open } from 'node:fs/promises';
import type { CommandExecutor, CommandSpec } from '../../../domain/interfaces/CommandExecutor.js';

export abstract class BaseCommandExecutor implements CommandExecutor {
  abstract execute(command: CommandSpec): Promise<void>;

  protected async run(
    bin: string,
    args: string[],
    env: NodeJS.ProcessEnv,
    stdoutFile: string,
  ): Promise<void> {
    await mkdir(dirname(stdoutFile), { recursive: true });
    const file = await open(stdoutFile, 'wx');

    try {
      await new Promise<void>((resolve, reject) => {
        const child = spawn(bin, args, {
          env,
          stdio: ['ignore', file.fd, 'inherit'],
        });

        child.on('error', reject);
        child.on('close', (code) =>
          code === 0 ? resolve() : reject(new Error(`${bin} exited with code ${code}`)),
        );
      });
    } finally {
      await file.close();
    }
  }
}
