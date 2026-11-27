---
status: accepted
date: 2026-11-23
decision-makers: StenSOn27
---

# Separate command building from command execution with a CommandExecutor (Bridge pattern)

## Context and Problem Statement

Casker runs native database tools (see
[ADR-0004](0004-use-native-database-tools-instead-of-drivers.md)). There are two independent sources
of variation:

- the database system: PostgreSQL, MySQL, MariaDB, MongoDB, each with its own tools and arguments
  (`n` variants)
- the place where the command runs: on the host machine, or inside a Docker container (`m`
  variants). A database on a remote server is reached from the host through the host and port of the
  connection config

If every combination were a separate class (for example `PostgresDockerBackupEngine`,
`PostgresLocalBackupEngine`, `MysqlDockerBackupEngine`, ...), the number of classes would grow as
`n * m`, and every new database system or execution mode would require a new class for each
combination.

How should the database-specific part and the execution-specific part be organized?

## Decision Drivers

- Adding a database system must not require touching execution modes, and the other way round
- The number of classes should grow linearly, not as a product
- Builders should be testable without running processes, and executors without knowing about
  databases
- The same execution modes should be shared by all slices (`backup`, `restore`, `connection`)

## Considered Options

- One class per combination of database system and execution mode (`n * m` classes)
- Separate the two dimensions with the Bridge pattern: command builders per database system and a
  `CommandExecutor` per execution mode, joined by composition (`n + m` classes)
- Execution-mode branching (`if docker ... else ...`) inside every command builder

## Decision Outcome

Chosen option: "Separate the two dimensions with the Bridge pattern", because the number of classes
changes from `n * m` to `n + m`, and each dimension can change independently.

- A command builder (per database system, and per operation) only describes _what_ to run as a
  `CommandSpec`: binary, arguments, environment and an optional input or output file. It knows
  nothing about where the command runs.
- A `CommandExecutor` (per execution mode) only knows _where and how_ to run a `CommandSpec`:
  `LocalCommandExecutor` runs it on the host, `DockerCommandExecutor` wraps it in
  `docker exec -i <container>`. It knows nothing about databases.
- An engine (for example `BackupEngineImpl`) receives a builder and an executor through its
  constructor and joins them: it asks the builder for the spec and passes it to the executor.
- The executor is chosen from an `ExecutionTarget` (`local` or `docker` with a container name) by a
  `CommandExecutorFactory`. `CommandExecutor`, `CommandSpec` and the factory are in `shared`,
  because all slices use the same execution modes.
- A database on a remote server needs no separate executor: it is reached by the local executor
  through the host and port of the connection config.

### Consequences

- Good, because adding a database system means adding builders only, and adding an execution mode
  means adding one executor class, which then works for every database system and operation.
- Good, because builders only produce data, so they can be tested without starting processes, and
  executors can be tested without a database.
- Good, because engines depend on abstractions (`CommandBuilder`, `CommandExecutor`), which fits the
  dependency direction from [ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md).
- Good, because all three slices reuse the same executors.
- Bad, because every executor has to interpret every field of `CommandSpec`, and the abstraction is
  only as good as that contract. For example, `DockerCommandExecutor` currently passes `env` to the
  local `docker` process, not into the container (it does not use `docker exec -e`), so environment
  variables set by a builder do not reach the tool inside the container.
- Bad, because adding an execution mode also means extending the `ExecutionTarget` type and the
  switch in `CommandExecutorFactoryImpl`, so the factory is not closed for modification.
- Bad, because executors do not translate between environments: file paths in a `CommandSpec` are
  host paths, and the Docker executor relies on standard input and output redirection (`stdinFile`,
  `stdoutFile`) to move data between the host and the container.

### Confirmation

Code review: builders must not contain execution-mode logic, and executors must not contain
database-specific logic.

## Pros and Cons of the Options

### One class per combination of database system and execution mode

- Good, because each class is simple and does one concrete thing.
- Bad, because the number of classes grows as `n * m`, with a lot of duplicated code.
- Bad, because adding a database system or an execution mode touches every combination.

### Bridge: builders per database system and an executor per execution mode

- Good, because the number of classes is `n + m` and the dimensions are independent.
- Good, because builders are pure and easy to test.
- Bad, because of the indirection and the contract that all executors must honor (see Consequences).

### Execution-mode branching inside every command builder

- Good, because there are fewer classes.
- Bad, because every builder repeats the same branching, and adding an execution mode means editing
  every builder.
- Bad, because builders would mix _what_ to run with _where_ to run it.

## More Information

- Interfaces: `src/shared/domain/interfaces/CommandExecutor.ts`,
  `src/shared/domain/factories/CommandExecutorFactory.ts`
- Executors and factory: `src/shared/infrastructure/executors/`,
  `src/shared/infrastructure/factories/CommandExecutorFactoryImpl.ts`
- Engines: `src/backup/infrastructure/engines/`, `src/restore/infrastructure/engines/`,
  `src/connection/infrastructure/engines/`
- Related: [ADR-0004](0004-use-native-database-tools-instead-of-drivers.md) (the tools that are
  executed)
