import { spawn } from 'node:child_process';
import { mkdir, type FileHandle } from 'node:fs/promises';
import { dirname } from 'node:path';
import { open } from 'node:fs/promises';
import type { CommandExecutor, CommandSpec } from '../../../domain/interfaces/CommandExecutor.js';

export abstract class BaseCommandExecutor implements CommandExecutor {
  abstract execute(command: CommandSpec): Promise<void>;

  protected async run(
    bin: string,
    args: string[],
    env: NodeJS.ProcessEnv,
    stdoutFile?: string,
    stdinFile?: string,
  ): Promise<void> {
    let stdout: FileHandle | undefined;
    let stdin: FileHandle | undefined;

    try {
      if (stdoutFile) {
        await mkdir(dirname(stdoutFile), { recursive: true });
        stdout = await open(stdoutFile, 'wx');
      } else if (stdinFile) {
        stdin = await open(stdinFile, 'wx');
      }

      await new Promise<void>((resolve, reject) => {
        const child = spawn(bin, args, {
          env,
          stdio: [stdin?.fd ?? 'ignore', stdout?.fd ?? 'inherit', 'inherit'],
        });

        child.on('error', reject);
        child.on('close', (code) =>
          code === 0 ? resolve() : reject(new Error(`${bin} exited with code ${code}`)),
        );
      });
    } finally {
      await stdout?.close();
      await stdin?.close();
    }
  }
}
