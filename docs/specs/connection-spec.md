# Specification: Connection

- **Status:** Implemented (retrospective spec)
- **Author:** StenSOn27
- **Date:** 2026-11-24

## 1. Context and Problem

Before running a backup or restore, a user wants a quick way to know whether the target database server is reachable, from the same place the other commands run (on the host or inside a Docker container). `casker connection` gives one uniform command for this check, regardless of whether the native tools are installed locally or only inside a container.

## 2. Goals and Non-Goals

**Goals:**

- Check with one CLI command whether the database server accepts connections.
- Run the check either on the host (`local`) or inside a running container (`docker`).
- Keep the design extensible so new databases (MySQL, MariaDB, MongoDB, etc.) can be added without changing the command's contract.

**Non-Goals:**

- Verifying credentials. The check confirms only that the server is available, not that the given username, password and database name are valid. This is intentional.
- Distinguishing failure causes (server rejecting connections, no response, invalid parameters). Planned, see section 7.
- Storing, creating or changing anything. The command has no side effects and writes nothing to the history.
- Running the check automatically before `backup` or `restore`. Not planned for now.
- Implementing the check for MySQL, MariaDB or MongoDB (planned, out of scope here).

## 3. Functional Requirements

- **FR-1:** The command is `casker connection` and accepts the flags listed in section 4.
- **FR-2:** The flags `type`, `host`, `port`, `username`, `password`, `database` and `execution` are required.
- **FR-3:** The flag `container` is required when `execution` is `docker`, and is used as the container name for `docker exec`.
- **FR-4:** For `postgresql`, the check runs `pg_isready -q -h <host> -p <port> -U <username> -d <database>`. It succeeds when the server accepts connections (exit code `0`).
- **FR-5:** The check does not authenticate. `--password` is accepted for a uniform flag set across commands but is not used by `pg_isready`; `--username` and `--database` only appear in the tool's own messages.
- **FR-6:** In `local` mode the tool is executed on the host; in `docker` mode it is executed as `docker exec -i <container> pg_isready <args>`. In `docker` mode, `--host` and `--port` are resolved from inside the container.
- **FR-7:** On success, the CLI prints `OK`.
- **FR-8:** If the tool cannot be started or exits with a non-zero code, a `ConnectionFailedError` with the reason (for example `pg_isready exited with code 2`) is thrown and the command exits with an error.
- **FR-9:** The database type is resolved to a connection builder through `ConnectionEngineFactory` keyed by `DriverType`. Supporting a new database requires adding a builder and registering it in the factory, with no changes to the CLI command or handler.

## 4. Interface

```
casker connection -t <type> -h <host> -p <port> -U <username> -P <password> \
                  -d <database> -e <local|docker> [-c <container>]
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

Examples:

```
casker connection -t postgresql -h localhost -p 5432 -U admin -P pass -d shop -e docker -c pg-container
casker connection -t postgresql -h localhost -p 5432 -U admin -P pass -d shop -e local
```

Output on success:

```
OK
```

Exit behavior: exit code `0` on success; non-zero with an error message when the check fails or flags are invalid.

## 5. Solution Design

Flow: oclif command `ConnectionCliCommand` -> `createConnectionHandler()` (composition) -> `ConnectionCommandHandler` -> `CommandExecutorFactory.create(execution)` and `ConnectionEngineFactory.create(type, executor)` -> `ConnectionEngineImpl.connection()` -> `PostgresConnectionCommandBuilder` produces a `CommandSpec` -> `CommandExecutor` (`LocalCommandExecutor` or `DockerCommandExecutor`) runs it.

Key decisions:

- **`pg_isready` instead of a real login.** It is fast, needs no password and has no side effects. The trade-off is that wrong credentials are not detected, which is accepted.
- **Same structure as `backup` and `restore`.** One builder per database, shared executors.

## 6. Edge Cases and Error Handling

| Situation                                       | Expected behavior                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `-e docker` without `-c`                        | Rejected by the CLI before running (flag dependency constraint)        |
| Missing required flag                           | oclif reports the missing flag; nothing is executed                    |
| Server is up                                    | `OK`, exit code `0`, even if the credentials or database are wrong     |
| Server is not reachable (no response)           | `ConnectionFailedError` (`pg_isready exited with code 2`)              |
| Server is starting up / rejecting connections   | `ConnectionFailedError` (`pg_isready exited with code 1`)              |
| Invalid parameters for the tool                 | `ConnectionFailedError` (`pg_isready exited with code 3`)              |
| Native tool not installed / container not found | Process error; `ConnectionFailedError` with the message                |
| Unsupported `type` (e.g. `mysql` for now)       | No builder is registered; the command fails                            |

## 7. Open Questions

- **Distinct error types (planned).** Failures are currently one `ConnectionFailedError` with the exit code in the message text. The plan is to add several error types so that causes can be told apart. Open points: which causes to separate (at minimum the `pg_isready` outcomes: rejecting connections, no response, invalid parameters, plus tool not found and container not found), how they are shown to the user, and whether they get different CLI exit codes.
- **Unused `--password`.** The flag is required but not used by `pg_isready`. It stays for a uniform flag set. Revisit it if the check ever authenticates, and consider whether it should then be optional for now.

## 8. Acceptance Criteria

- [ ] With a running PostgreSQL server, `casker connection` prints `OK` and exits with code `0` in both `local` and `docker` modes.
- [ ] With the server stopped or a wrong host or port, the command exits with an error that includes the tool's exit code.
- [ ] With a wrong password but a reachable server, the command still prints `OK`.
- [ ] A non-existent container name or missing tool produces an error.
- [ ] `-e docker` without `-c` is rejected.
- [ ] The command does not create or change any file or database record.
