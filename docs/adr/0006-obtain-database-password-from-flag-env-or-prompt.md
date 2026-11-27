---
status: accepted
date: 2026-11-23
decision-makers: StenSOn27
---

# Obtain the database password from an optional flag, then the environment, then an interactive prompt

## Context and Problem Statement

Backup, restore and connection checks need the database password. Casker is a command-line tool used
in two very different ways: interactively by a person, and non-interactively from scripts and cron
jobs.

If the password is part of the command line (for example a `-P <password>` flag), it ends up in the
shell history in plain text and is visible to other users of the machine in the list of running
processes. But a tool that can only ask for a password interactively cannot be used from scripts and
cron jobs.

How should Casker obtain the database password?

## Decision Drivers

- The password should not end up in the shell history when a person uses Casker interactively
- The password should not be visible on the screen while typing
- Familiar behavior: the same way as `ssh` and many other tools ask for a password
- Scripts and cron jobs must be able to provide the password without a person typing it

## Considered Options

- A password flag on the command line only (`-P <password>`)
- An environment variable only
- An interactive prompt with hidden input only
- A configuration file or credential store
- A fallback chain: an optional flag, then the environment, then an interactive prompt

## Decision Outcome

Chosen option: "A fallback chain: an optional flag, then the environment, then an interactive
prompt", because it keeps the safe behavior for people and still supports scripts and cron jobs.

The password is taken from the first available source:

1. The password flag, if it was passed.
2. The `CASKER_PASSWORD` environment variable, if it is set.
3. An interactive prompt with hidden input (the typed characters are not shown, like when connecting
   to a server over SSH), shown before the command is executed.

An interactive user simply omits the flag and the variable, and is asked for the password, so
nothing is stored in the shell history. Scripts and cron jobs pass the flag or set the variable. The
variable has a Casker-specific name instead of a per-database one (such as `PGPASSWORD`), so the
same variable works for every supported database system and does not clash with the variables that
the native tools read themselves.

The password is resolved in the presentation layer (the CLI commands), before the command is
executed. It is then passed to the application layer inside the command object like any other input.
The same behavior applies to all commands that need a password (`backup`, `restore`, `connection`).

### Consequences

- Good, because an interactive user who omits the flag is asked for the password, so it does not end
  up in the shell history or on the screen, and the behavior is familiar from `ssh`.
- Good, because scripts and cron jobs can provide the password through the flag or the environment
  without a person present.
- Good, because the environment variable keeps the password off the command line in non-interactive
  use.
- Bad, because the flag is still accepted. When it is used, the password is saved in the shell
  history and is visible in the process list. Nothing prevents a person from typing it interactively
  and losing the protection, so the flag is intended for non-interactive use only.
- Bad, because of the precedence between the sources: a stale environment variable is silently used
  instead of showing the prompt, and the flag overrides the variable.
- Bad, because there are three sources of the same value, which means more code and more cases to
  test than a single source.
- Bad, because in a non-interactive environment without a flag or a variable there is nobody to
  answer the prompt, so the command cannot continue.
- Bad, because the prompt is a presentation concern: other delivery mechanisms (for example a future
  HTTP API) will need their own way to obtain credentials.
- Bad, because this decision covers how Casker obtains the password from the user, not how it is
  passed on to the native tool. That step must not put the password on the command line of the tool,
  and it depends on the executor (see
  [ADR-0005](0005-use-command-executor-bridge-for-execution-modes.md)): for example, the Docker
  executor does not forward environment variables into the container.

### Confirmation

Code review: the password flag is optional, and every command that needs a password resolves it
through the same chain (flag, environment, hidden-input prompt).

## Pros and Cons of the Options

### A password flag on the command line only

- Good, because it is simple and works in scripts.
- Bad, because the password is saved in the shell history in plain text.
- Bad, because the password is visible in the process list and in the terminal while typing.

### An environment variable only

- Good, because it does not appear in the command line or the shell history, and works in scripts.
- Bad, because the value is often exported in profiles or typed as `VAR=... casker ...`, which puts
  it back in the history.
- Bad, because a person working interactively has no safe default and has to set the variable first.

### An interactive prompt with hidden input only

- Good, because the password is not stored anywhere and is not visible when typed.
- Bad, because it cannot be answered in scripts, cron jobs and CI, so they would not be supported.

### A configuration file or credential store

- Good, because the user does not have to type the password each time, and it works in scripts.
- Bad, because the password is stored on disk, so it needs file permissions or encryption, which is
  a larger scope than a small CLI justifies.

### A fallback chain: an optional flag, then the environment, then an interactive prompt

- Good, because it covers both interactive and non-interactive use (see Decision Outcome).
- Bad, because the flag remains a way to leak the password, and because of the precedence and the
  extra code (see Consequences).

## More Information

- Commands that need a password: `src/backup/presentation/cli/commands/`,
  `src/restore/presentation/cli/commands/`, `src/connection/presentation/cli/commands/`
- Related: [ADR-0004](0004-use-native-database-tools-instead-of-drivers.md) (the native tools that
  receive the credentials)
- Related: [ADR-0005](0005-use-command-executor-bridge-for-execution-modes.md) (executors and the
  `CommandSpec` contract)
