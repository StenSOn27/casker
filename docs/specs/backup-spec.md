# Specification: Backup

- **Status:** Implemented (retrospective spec)
- **Author:** StenSOn27
- **Date:** 2026-11-24

## 1. Context and Problem

Creating a database backup normally means remembering the right native tool, its flags and where the database runs (on the host or inside a Docker container). `casker backup` gives one uniform CLI command that creates a backup file for a database connection, regardless of whether the native tools are installed locally or only inside a container. Each attempt, successful or failed, is recorded in the backup history.

## 2. Goals

- Create a backup file of a single database with one CLI command.
- Run the native dump tool either on the host (`local`) or inside a running container (`docker`).
- Let the user choose the output directory, with a sensible default.
- Record every attempt (success and failure) in the persistent backup history.
- Keep the design extensible so new databases (MySQL, MariaDB, MongoDB, etc.) can be added without changing the command's contract.

## 3. Non-Goals

- Listing backup history (`backup list` is a separate feature).
- Restoring backups (`restore` slice).
- Compression, encryption, retention or rotation of backup files.
- Scheduled or incremental backups.
- Backing up multiple databases or a whole server in one call.
- Implementing the dump logic for MySQL, MariaDB or MongoDB (planned, out of scope here; see section 9).

## 4. User Scenarios

- As a developer, I want to back up a PostgreSQL database running in a Docker container, so that I do not need `pg_dump` installed on my machine.
- As an operator, I want to back up a database with host-installed tools (`-e local`), so that no Docker is required.
- As a user, I want to choose where the file is saved with `-o`, and otherwise get it in `./backups`, so that I always know where to find it.
- As a user, I want failed backups to be recorded with the reason, so that I can see what went wrong later.

## 5. Functional Requirements

- **FR-1:** The command is `casker backup` and accepts the flags listed in section 7.
- **FR-2:** The flags `type`, `host`, `port`, `username`, `password`, `database` and `execution` are required.
- **FR-3:** The flag `container` is required when `execution` is `docker`, and is used as the container name for `docker exec`.
- **FR-4:** The output directory is taken from `-o`; if omitted, it defaults to `./backups`. The directory (including parents) is created if it does not exist.
- **FR-5:** The backup file is named `<type>-<database>-<ISO timestamp>.dump`, where `:` and `.` in the timestamp are replaced by `-`. Example: `postgresql-shop-2026-11-24T12-00-00-000Z.dump`.
- **FR-6:** The file is never overwritten: if a file with the same name already exists, the backup fails.
- **FR-7:** For `postgresql`, the backup runs `pg_dump -h <host> -p <port> -U <username> -d <database> -Fc` and its stdout is written to the backup file (PostgreSQL custom format).
- **FR-8:** In `local` mode the tool is executed on the host; in `docker` mode it is executed as `docker exec -i <container> <tool> <args>`. The dump is always written to a file on the host, not inside the container.
- **FR-9:** On success, a `BackupResult` with status `success`, the file path, the file size in bytes and the database name is persisted, and the CLI prints `Backup created successfully! Backup ID: <id>`.
- **FR-10:** On failure of the dump process, the partially written file is removed, a `BackupResult` with status `failed`, size `0` and the error message is persisted, and the command exits with an error.
- **FR-11:** The database type is resolved to a backup builder through `BackupEngineFactory` keyed by `DriverType`. Supporting a new database requires adding a builder and registering it in the factory, with no changes to the CLI command or handler.

## 6. Non-Functional Requirements

- **NFR-1:** The dump is streamed from the tool's stdout directly to a file handle, so memory usage does not grow with database size.
- **NFR-2:** The command depends only on the native tool (and `docker` for container mode); it must not require any server or daemon of its own.
- **NFR-3:** History is stored in the local SQLite database in the OS data directory (see CLAUDE.md), so it persists between runs.

## 7. Interface / API

```
casker backup -t <type> -h <host> -p <port> -U <username> -P <password> \
              -d <database> -e <local|docker> [-c <container>] [-o <outputDir>]
```

| Flag          | Short | Required              | Default     | Description                    |
| ------------- | ----- | --------------------- | ----------- | ------------------------------ |
| `--type`      | `-t`  | yes                   | -           | Database type (`postgresql`)   |
| `--host`      | `-h`  | yes                   | -           | Database host                  |
| `--port`      | `-p`  | yes                   | -           | Database port (integer)        |
| `--username`  | `-U`  | yes                   | -           | Database user                  |
| `--password`  | `-P`  | yes                   | -           | Database password              |
| `--database`  | `-d`  | yes                   | -           | Database name                  |
| `--execution` | `-e`  | yes                   | -           | Execution target               |
| `--container` | `-c`  | if `-e docker`        | -           | Docker container name          |
| `--outputDir` | `-o`  | no                    | `./backups` | Output directory               |

Examples:

```
casker backup -t postgresql -h localhost -p 5432 -U admin -P pass -d shop -e docker -c pg-container
casker backup -t postgresql -h localhost -p 5432 -U admin -P pass -d shop -e local -o ./my-dumps
```

Output on success:

```
Backup created successfully! Backup ID: 3f2b8c1e-...
```

Exit behavior: exit code `0` on success; non-zero with an error message when the dump fails or flags are invalid.

## 8. Data Model

A `BackupResult` is persisted for every attempt (table managed by TypeORM, mapped through `BackupResultMapper`):

| Field          | Description                                         |
| -------------- | --------------------------------------------------- |
| `id`           | UUID v4                                             |
| `driverType`   | Database type, e.g. `postgresql`                    |
| `filePath`     | Path of the backup file (also set on failure)       |
| `sizeBytes`    | File size in bytes; `0` for failed backups          |
| `status`       | `success` or `failed`                               |
| `name`         | Database name                                       |
| `errorMessage` | Failure reason; only for `failed`                   |
| `createdAt`    | Time of the attempt                                 |

Instances are created only through `BackupResult.succeeded(...)` and `BackupResult.failed(...)`.

## 9. Solution Design

Flow: oclif command `CreateBackupCliCommand` -> `createBackupHandler()` (composition) -> `CreateBackupCommandHandler` -> `CommandExecutorFactory.create(execution)` and `BackupEngineFactory.create(type, executor)` -> `BackupEngineImpl.backup()` -> `PostgresBackupCommandBuilder` produces a `CommandSpec` -> `CommandExecutor` (`LocalCommandExecutor` or `DockerCommandExecutor`) runs it, with stdout redirected to the backup file.

Key decisions:

- **Builder per database.** Each database only differs in the command it needs, so that part is isolated in a `BackupCommandBuilder`; the engine, handler and CLI stay unchanged. Planned: MySQL, MariaDB, MongoDB (the builders map in `BackupEngineFactoryImpl.ts` is already prepared for them).
- **Executor abstraction.** Local and Docker execution share one `BaseCommandExecutor`; only the command wrapping differs.
- **Failures are recorded in the handler.** `BackupEngineImpl` throws `BackupFailedError` (carrying the file path and reason) and the handler turns it into a persisted failed `BackupResult` before rethrowing.

## 10. Edge Cases and Error Handling

| Situation                                        | Expected behavior                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `-e docker` without `-c`                         | Rejected by the CLI before running (flag dependency constraint)                     |
| Missing required flag                            | oclif reports the missing flag; nothing is executed or recorded                     |
| Output directory does not exist                  | Created recursively                                                                 |
| Backup file already exists                       | Fails (file opened in exclusive mode); recorded as `failed`                         |
| Native tool not installed / container not found  | Process error; partial file removed; recorded as `failed` with the error message    |
| Tool exits with non-zero code                    | Error `<bin> exited with code <n>`; partial file removed; recorded as `failed`      |
| Unsupported `type` (e.g. `mysql` for now)        | No builder is registered; the command fails                                         |

## 11. Acceptance Criteria

- [ ] `casker backup` with valid flags and `-e docker -c <container>` creates a `.dump` file in `./backups` and prints the backup ID.
- [ ] The same command with `-e local` works with host-installed `pg_dump`.
- [ ] With `-o <dir>` the file is created in `<dir>`, and the directory is created if missing.
- [ ] The produced file is in PostgreSQL custom format and can be read by `pg_restore`.
- [ ] A successful run adds one `success` record with the correct size and database name.
- [ ] A failing run leaves no partial file and adds one `failed` record with an error message.
- [ ] `-e docker` without `-c` is rejected.

## 12. Testing Plan

There are currently no automated tests in the project. Suggested coverage:

- **Unit:** `PostgresBackupCommandBuilder` (args, `-Fc`, `stdoutFile`), `buildBackupFileName` format, `BackupResult.succeeded` / `failed`, handler behavior on `BackupFailedError` (failed record saved, error rethrown) with fake engine, executor and repository.
- **Integration:** run against a PostgreSQL container for both `local` and `docker` modes; verify the file with `pg_restore --list`.
- **Manual:** failure scenarios from section 10.

## 13. Open Questions

Found while writing this spec from the current code; they describe gaps, not intended behavior:

- **Password is not passed to the tool.** `--password` is required and is part of the connection, but `PostgresBackupCommandBuilder` sets `env: {}`, so `pg_dump` never receives `PGPASSWORD`. A backup of a server that requires a password will fail unless the password is supplied some other way. Should the builder set `PGPASSWORD`? (For `docker exec`, `env` is not forwarded into the container either, so `-e PGPASSWORD=...` would be needed in the `docker exec` arguments.)
- **`mysql` is accepted by the type system** (`MySqlConnectionProps`) but has no builder yet. Should unsupported types fail with a clear, dedicated error message?
