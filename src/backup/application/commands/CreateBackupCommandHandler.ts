import { CommandHandler } from '../../../shared/application/handlers/CommandHandler.js';
import { BackupEngineFactory } from '../../domain/factories/BackupEngineFactory.js';
import { BackupResultRepository } from '../../domain/repositories/BackupResultRepository.js';
import type { CommandExecutorFactory } from '../../domain/factories/CommandExecutorFactory.js';
import type { CreateBackupCommand } from './CreateBackupCommand.js';
import { BackupResult } from '../../domain/entities/BackupResult.js';
import { BackupFailedError } from '../../domain/errors/BackupFailedError.js';

export class CreateBackupCommandHandler implements CommandHandler<CreateBackupCommand, string> {
  private repository: BackupResultRepository;
  private engineFactory: BackupEngineFactory;
  private executorFactory: CommandExecutorFactory;

  constructor(
    repository: BackupResultRepository,
    engineFactory: BackupEngineFactory,
    executorFactory: CommandExecutorFactory,
  ) {
    this.repository = repository;
    this.engineFactory = engineFactory;
    this.executorFactory = executorFactory;
  }

  async handle(command: CreateBackupCommand): Promise<string> {
    const executor = await this.executorFactory.create(command.execution);
    const backupEngine = await this.engineFactory.create(command.connection.type, executor);

    try {
      const backupResult = await backupEngine.backup(command.connection, command.outputDir);
      await this.repository.create(backupResult);
      return backupResult.getId();
    } catch (err) {
      if (err instanceof BackupFailedError) {
        const failed = BackupResult.create(
          command.connection.type,
          command.outputDir,
          0,
          'failed',
          command.connection.database,
          err.message,
        );
        await this.repository.create(failed);
      }
      throw err;
    }
  }
}
