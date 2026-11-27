---
status: accepted
date: 2026-11-23
decision-makers: StenSOn27
---

# Use native database tools instead of implementing backup and restore with drivers

## Context and Problem Statement

Casker must create backups of databases, restore them and check connections, and it is meant to
support several database systems (PostgreSQL now; MySQL, MariaDB and MongoDB are planned). Each
database system already ships its own command-line tools for this (`pg_dump`, `pg_restore`,
`pg_isready` for PostgreSQL, and equivalents for the others).

Should Casker implement backup, restore and connection checks itself on top of database drivers, or
should it run the native tools?

## Decision Drivers

- Reliability: backup and restore are operations where an error means data loss, so proven and
  widely tested implementations are preferred
- Implementation effort: backup and restore would have to be implemented separately for every
  supported database system
- Compatibility with the native ecosystem: users must be able to work with Casker's artifacts using
  the native tools and vice versa
- Risk of mistakes in the code that Casker maintains

## Considered Options

- Run the native tools (`pg_dump`, `pg_restore`, `pg_isready` and equivalents) as child processes
- Implement backup, restore and connection checks in Casker using database drivers

## Decision Outcome

Chosen option: "Run the native tools as child processes", because of three reasons:

1. **Reliability.** Our own implementation would almost certainly be worse than the native commands,
   which have been designed, used and tested for many years.
2. **Effort and risk.** A driver-based implementation would mean implementing backup and restore
   from scratch for every database system, which takes a lot of time and carries a high risk of
   errors.
3. **Compatibility.** Casker is only an orchestrator that calls the same native commands under the
   hood. A user can create a backup with Casker and restore it with a native command (or the other
   way round) without any problems, because the artifacts are in the native tools' format. For
   PostgreSQL Casker uses the custom format (`pg_dump -Fc`), which `pg_restore` reads.

Technically, each database system has a command builder that produces a command specification
(binary, arguments, environment, input or output file). A `CommandExecutor` runs it as a child
process, either on the host or inside a Docker container via `docker exec`. Arguments are passed as
an array to `spawn` without a shell.

### Consequences

- Good, because Casker relies on proven, maintained tools and does not carry the risk of its own
  dump and restore logic.
- Good, because adding a database system means writing a command builder, not a backup engine.
- Good, because backups are interoperable with the native tools in both directions.
- Good, because passing arguments as an array without a shell avoids shell injection through values
  like host or database name.
- Bad, because in local mode the client tools must be installed on the machine that runs Casker.
  This is usually already the case when the database server runs on the same machine, but not when
  Casker connects to a remote database or to a container through a published port. In Docker mode
  the tools normally come with the database image. This is mitigated by detecting a missing tool and
  showing a hint that covers the likely cases: install the client tools for the current operating
  system (typical when the database is on a remote server), add the `bin` directory of a locally
  installed server to `PATH` (the tools are often installed but not on `PATH`), or switch to Docker
  mode if the database runs in a container. Casker does not install the tools itself, because that
  requires elevated privileges and differs between operating systems and package managers.
- Bad, because the tool version matters: for example, `pg_dump` may refuse to work with a newer
  server version, and a backup may require a matching `pg_restore` version.
- Bad, because Casker's behavior depends on the external environment (PATH, operating system, tool
  versions), which makes it harder to test than pure code.

### Confirmation

Code review: backup, restore and connection logic is expressed as command builders plus the
executor, and does not use database drivers.

## Pros and Cons of the Options

### Run the native tools as child processes

- Good, because of reliability, low implementation effort and compatibility with the native
  ecosystem (see Decision Outcome).
- Bad, because of the external dependency on installed tools, tool versions and limited error
  information (see Consequences).

### Implement backup, restore and connection checks with database drivers

- Good, because no external tools would be required and Casker would be self-contained.
- Good, because Casker would have full control over error handling and progress reporting.
- Bad, because it would be much worse than the mature native tools, and it would have to be
  implemented again for every database system.
- Bad, because the high risk of errors in a backup tool means a risk of data loss.
- Bad, because backups would be in Casker's own format, so users could not freely switch between
  Casker and the native tools.

## More Information

- Command builders: `src/backup/infrastructure/builders/`, `src/restore/infrastructure/builders/`,
  `src/connection/infrastructure/builders/`
- Executors: `src/shared/infrastructure/executors/`
- Related: [ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md) (slices and layers
  that contain the builders)
