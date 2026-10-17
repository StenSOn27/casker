import CreateBackupCliCommand from '../../backup/presentation/cli/commands/CreateBackupCliCommand.js';
import ListBackupCliCommand from '../../backup/presentation/cli/commands/ListBackupCliCommand.js';
import RestoreCliCommand from '../../restore/presentation/cli/commands/RestoreCliCommand.js';

export const COMMANDS = {
  backup: CreateBackupCliCommand,
  'backup:list': ListBackupCliCommand,
  restore: RestoreCliCommand,
};
