import CreateBackupCliCommand from '../../backup/presentation/cli/commands/CreateBackupCliCommand.js';
import ListBackupCliCommand from '../../backup/presentation/cli/commands/ListBackupCliCommand.js';

export const COMMANDS = {
  backup: CreateBackupCliCommand,
  'backup:list': ListBackupCliCommand,
};
