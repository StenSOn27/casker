---
status: accepted
date: 2026-11-23
decision-makers: StenSOn27
---

# Use the built-in node:sqlite module to store the backup history

## Context and Problem Statement

Casker stores the history of backups (`casker backup list`) in a local database file in the
application data directory. The first implementation used `better-sqlite3` together with TypeORM.

`better-sqlite3` is a native module that gets its binary through an install script. Package managers
(npm and others) do not run install scripts of dependencies without the user's permission. As a
result, for users who install Casker globally from npm, the native binary is not installed, the
history database cannot be initialized and the CLI does not work. This cannot be fixed from the side
of the package, because the permission has to be given by the user.

How should the backup history be stored so that Casker works right after a normal installation?

## Decision Drivers

- Casker must work immediately after `npm install -g`, without extra steps from the user
- No native dependency that requires an install script
- Support for queries (the history is listed and filtered)
- Safe access when several Casker processes run at the same time
- Few dependencies

## Considered Options

- `node:sqlite`, the SQLite module built into Node.js, without an ORM
- `better-sqlite3` (with TypeORM) and an instruction for users to approve its build script
  (`approve-builds`)
- `sql.js` (SQLite compiled to WebAssembly)
- A JSON file

## Decision Outcome

Chosen option: "`node:sqlite`", because it is part of Node.js itself, so there is nothing to build
or download and no install script that a package manager may refuse to run. The history database is
initialized right after installation, and it is still a real SQLite database file that supports SQL
queries.

`better-sqlite3` and TypeORM are removed from the dependencies, and the history is accessed with SQL
through `node:sqlite` directly.

### Consequences

- Good, because Casker works after a normal global installation, with no steps for the user and no
  dependence on the package manager's script policy.
- Good, because there is no native module to build or download, so installation is simpler and more
  reliable.
- Good, because the history is a regular SQLite database: SQL queries, and safe access from several
  processes handled by SQLite.
- Good, because `better-sqlite3` and TypeORM are removed from the dependencies, so there are fewer
  packages to install and maintain.
- Bad, because `node:sqlite` requires a recent Node.js version. It is available without a flag only
  in newer releases of Node 22 and later, and the `package.json` has no `engines` field yet, so the
  minimum version has to be declared.
- Bad, because `node:sqlite` is a young part of Node.js. Depending on the Node version it may still
  be marked as experimental, may print a warning, and its API may change.
- Bad, because without an ORM there are no entity classes and no automatic mapping. Queries are
  written in SQL and mapped to domain objects by hand.
- Bad, because TypeORM migrations go away, so a replacement for applying schema changes to an
  existing history database is needed. That is not decided here.
- Bad, because the API of `node:sqlite` is synchronous, which blocks the event loop while a query
  runs. This is acceptable for a short-lived CLI but should be kept in mind.

### Confirmation

Code review: persistence uses `node:sqlite` only, and `better-sqlite3` and TypeORM are not in the
dependencies.

## Pros and Cons of the Options

### `node:sqlite`

- Good, because it is built in: no native module, no install script, and no extra dependency.
- Good, because it provides a real SQLite database with SQL queries and safe concurrent access.
- Bad, because it requires a recent Node.js, is still maturing, and has no ORM (see Consequences).

### `better-sqlite3` (with TypeORM) and an `approve-builds` instruction

- Good, because it is mature, fast and widely used, and TypeORM provides entities and migrations.
- Bad, because it is a native module with an install script. Without the user's permission the
  script is not run, the database is not initialized and the CLI does not work.
- Bad, because the permission has to be given by the user, so it cannot be fixed from the side of
  the package. An instruction in the documentation does not help the users who do not read it, and
  the failure looks like a broken tool.

### `sql.js`

- Good, because it needs no native build or install script.
- Good, because it supports SQL.
- Bad, because the database lives in memory: the whole database is loaded into memory and the whole
  file has to be saved again when the data changes.

### A JSON file

- Good, because it needs no dependency and is simple.
- Bad, because there are no SQL queries.
- Bad, because the file is read completely on every access.
- Bad, because there is no protection against concurrent writes from several processes.

## More Information

- Related: [ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md) (where the
  database connection is created and how repositories receive it)
- Related: [ADR-0003](0003-use-bootstrap-composition-root-with-manual-wiring.md) (the composition
  root that creates it)
