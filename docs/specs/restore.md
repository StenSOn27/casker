# Specification: Restore

- **Status:** Implemented (retrospective spec)
- **Author:** StenSOn27
- **Date:** 2026-11-24

## 1. Context and Problem

Restoring a database from a backup normally requires knowing the right native tool, its flags and where the database runs (on the host or inside a Docker container). `casker restore` gives one uniform CLI command that loads a backup file created by `casker backup` into an existing database, regardless of whether the native tools are installed locally or only inside a container.

## 2. Goals

- Restore a single database from a backup file with one CLI command.
- Run the native restore tool either on the host (`local`) or inside a running container (`docker`).
- Make restore work on a target database that already contains the same objects, replacing them instead of failing.
- Keep the design extensible so new databases (MySQL, MariaDB, MongoDB, etc.) can be added without changing the command's contract.

## 3. Non-Goals

- Creating the target database. It must already exist.
- Restoring by backup ID from the history. This is planned (see section 9), but the current command takes only a file path.
- Recording restore attempts in the persistent history (unlike `backup`, `restore` stores nothing).
- Asking for confirmation before overwriting data.
- Partial restore (selected tables or schemas), or restore into a different database type.
- Implementing restore for MySQL, MariaDB or MongoDB (planned, out of scope here).

## 4. User Scenarios

- As a developer, I want to restore a dump into a PostgreSQL database in a Docker container, so that I do not need `pg_restore` installed on my machine.
- As an operator, I want to restore with host-installed tools (`-e local`), so that no Docker is required.
- As a user, I want to restore over a database that already has the tables, so that I do not have to drop them by hand first.

## 5. Functional Requirements

- **FR-1:** The command is `casker restore` and accepts the flags listed in section 7.
- **FR-2:** The flags `type`, `host`, `port`, `username`, `password`, `database`, `execution` and `filepath` are required.
- **FR-3:** The flag `container` is required when `execution` is `docker`, and is used as the container name for `docker exec`.
- **FR-4:** The target database must already exist. The command does not create it.
- **FR-5:** For `postgresql`, the restore runs `pg_restore -Fc -v -h <host> -p <port> -U <username> -d <database> --clean --if-exists`. The backup file is fed to the tool through stdin, so the tool does not need access to the file path.
- **FR-6:** `--clean --if-exists` is used on purpose: existing objects are dropped (if present) and recreated from the backup. This avoids errors that happened when restoring into a database whose tables already existed.
- **FR-7:** In `local` mode the tool is executed on the host; in `docker` mode it is executed as `docker exec -i <container> pg_restore <args>`. The backup file is always read from the host, not from inside the container.
- **FR-8:** The tool's stdout and stderr are passed through to the terminal (`-v` makes `pg_restore` print verbose progress).
- **FR-9:** On success, the CLI prints `Database restored successfully!`.
- **FR-10:** If the tool cannot be started, the file cannot be opened, or the tool exits with a non-zero code, a `RestoreFailedError` with the reason is thrown and the command exits with an error.
- **FR-11:** The database type is resolved to a restore builder through `RestoreEngineFactory` keyed by `DriverType`. Supporting a new database requires adding a builder and registering it in the factory, with no changes to the CLI command or handler.

## 6. Non-Functional Requirements

- **NFR-1:** The backup file is streamed to the tool through a file handle, so memory usage does not grow with backup size.
- **NFR-2:** The command depends only on the native tool (and `docker` for container mode); it must not require any server or daemon of its own.

## 7. Interface / API

```
casker restore -t <type> -h <host> -p <port> -U <username> -P <password> \
               -d <database> -e <local|docker> [-c <container>] -f <backupFile>
```

| Flag          | Short | Required       | Description                  |
| ------------- | ----- | -------------- | ---------------------------- |
| `--type`      | `-t`  | yes            | Database type (`postgresql`) |
| `--host`      | `-h`  | yes            | Database host                |
| `--port`      | `-p`  | yes            | Database port (integer)      |
| `--username`  | `-U`  | yes            | Database user                |
| `--password`  | `-P`  | yes            | Database password            |
| `--database`  | `-d`  | yes            | Database name                |
| `--execution` | `-e`  | yes            | Execution target             |
| `--container` | `-c`  | if `-e docker` | Docker container name        |
| `--filepath`  | `-f`  | yes            | Path to the backup file      |

Examples:

```
casker restore -t postgresql -h localhost -p 5432 -U admin -P pass -d shop -e docker -c pg-container -f ./backups/postgresql-shop-2026-11-24T12-00-00-000Z.dump
casker restore -t postgresql -h localhost -p 5432 -U admin -P pass -d shop -e local -f ./my-dumps/shop.dump
```

Output on success:

```
Database restored successfully!
```

Exit behavior: exit code `0` on success; non-zero with an error message when the restore fails or flags are invalid.

## 8. Data Model

No changes. `restore` does not read or write the backup history.

## 9. Solution Design

Flow: oclif command `RestoreCliCommand` -> `createRestoreHandler()` (composition) -> `RestoreCommandHandler` -> `CommandExecutorFactory.create(execution)` and `RestoreEngineFactory.create(type, executor)` -> `RestoreEngineImpl.restore()` -> `PostgresRestoreCommandBuilder` produces a `CommandSpec` -> `CommandExecutor` (`LocalCommandExecutor` or `DockerCommandExecutor`) runs it, with the backup file as stdin.

Key decisions:

- **Backup file via stdin.** For Docker the file lives on the host and the container cannot see it. Passing it through `docker exec -i` and stdin avoids mounting volumes or copying the file into the container. The same mechanism is used for `local`, so both modes behave the same.
- **`--clean --if-exists`.** Restoring into a database that already had the tables failed with errors. Dropping existing objects first makes restore repeatable. The cost is that existing data in those objects is lost, which is accepted.
- **Builder per database and shared executors.** Same structure as `backup`; only the command differs per database.

Planned (not part of this spec): restore by backup ID from the history. It would look up the file path of a successful `BackupResult` and call the same restore flow, so the current `--filepath` flow stays valid.

## 10. Edge Cases and Error Handling

| Situation                                       | Expected behavior                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `-e docker` without `-c`                        | Rejected by the CLI before running (flag dependency constraint)             |
| Missing required flag                           | oclif reports the missing flag; nothing is executed                         |
| Backup file does not exist or is unreadable     | Opening the file fails; `RestoreFailedError`; the tool is not started       |
| Target database does not exist                  | `pg_restore` exits with a non-zero code; `RestoreFailedError`               |
| Target database already contains the objects    | Objects are dropped and recreated (`--clean --if-exists`); not an error     |
| Native tool not installed / container not found | Process error; `RestoreFailedError` with the message                        |
| Tool exits with non-zero code                   | Error `<bin> exited with code <n>`; `RestoreFailedError`                    |
| Unsupported `type` (e.g. `mysql` for now)       | No builder is registered; the command fails                                 |

## 11. Acceptance Criteria

- [ ] `casker restore` with valid flags and `-e docker -c <container>` restores a dump created by `casker backup` into an existing database and prints `Database restored successfully!`.
- [ ] The same command with `-e local` works with host-installed `pg_restore`.
- [ ] Restoring into a database that already contains the same tables succeeds and the data matches the backup.
- [ ] A missing backup file produces an error and does not change the database.
- [ ] A non-existent target database produces an error.
- [ ] `-e docker` without `-c` is rejected.

## 12. Testing Plan

There are currently no automated tests in the project. Suggested coverage:

- **Unit:** `PostgresRestoreCommandBuilder` (args, `--clean --if-exists`, `stdinFile`), `RestoreEngineImpl` wraps executor errors into `RestoreFailedError`, handler resolves executor and engine from the factories (with fakes).
- **Integration:** `backup` then `restore` round trip against a PostgreSQL container for both `local` and `docker`; restore twice into the same database to verify `--clean --if-exists`.
- **Manual:** the failure scenarios from section 10.

## 13. Open Questions

- **Password is not passed to the tool.** `--password` is required, but `PostgresRestoreCommandBuilder` sets `env: {}`, so `pg_restore` never receives `PGPASSWORD`. Same issue as in the `backup` spec; known and tracked separately.
- **Restore by backup ID.** Planned. Open design points: the new flag name (for example `--id`), whether it is mutually exclusive with `--filepath`, and whether the restore result should then be recorded in the history.
