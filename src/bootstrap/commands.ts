import type {
  BackupListItem,
  ListBackupQuery,
} from '../backup/application/queries/ListBackupQuery.js';
import type { CreateBackupCommand } from '../backup/application/commands/CreateBackupCommand.js';
import type { RestoreCommand } from '../restore/application/commands/RestoreCommand.js';
import type { ConnectionCommand } from '../connection/application/commands/ConnectionCommand.js';
import type { Handler } from '../shared/application/handlers/Handler.js';
import CreateBackupCliCommand from '../backup/presentation/cli/CreateBackupCliCommand.js';
import ListBackupCliCommand from '../backup/presentation/cli/ListBackupCliCommand.js';
import ConnectionCliCommand from '../connection/presentation/cli/ConnectionCliCommand.js';
import RestoreCliCommand from '../restore/presentation/cli/RestoreCliCommand.js';
import { CommandExecutorFactoryImpl } from '../shared/infrastructure/factories/CommandExecutorFactoryImpl.js';
import { composeCreateBackupHandler } from './compose/backup/ComposeCreateBackup.js';
import { composeListBackupHandler } from './compose/backup/ComposeListBackup.js';
import { composeConnectionHandler } from './compose/connection/ComposeConnectionHandler.js';
import { composeRestoreHandler } from './compose/restore/ComposeRestoreHandler.js';

const executorFactory = new CommandExecutorFactoryImpl();

class CreateBackup extends CreateBackupCliCommand {
  protected createHandler(): Handler<CreateBackupCommand, string> {
    return composeCreateBackupHandler(executorFactory);
  }
}

class ListBackup extends ListBackupCliCommand {
  protected createHandler(): Handler<ListBackupQuery, BackupListItem[]> {
    return composeListBackupHandler();
  }
}

class Restore extends RestoreCliCommand {
  protected createHandler(): Handler<RestoreCommand, void> {
    return composeRestoreHandler(executorFactory);
  }
}

class Connection extends ConnectionCliCommand {
  protected createHandler(): Handler<ConnectionCommand, void> {
    return composeConnectionHandler(executorFactory);
  }
}

export const COMMANDS = {
  backup: CreateBackup,
  'backup:list': ListBackup,
  restore: Restore,
  connection: Connection,
};
