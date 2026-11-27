---
status: accepted
date: 2026-11-22
decision-makers: StenSOn27
---

# Use oclif as the CLI framework with an explicit command registry

## Context and Problem Statement

Casker currently exposes a CLI (`casker backup`, `casker restore`, `casker connection`,
`casker backup list`) distributed via npm. We need a framework for argument/flag parsing, help
generation and command dispatch. The project is written in an object-oriented style, and the
presentation layer should look like HTTP controllers: one class per command that receives input
(flags/args), delegates to an application handler and renders the result. Commands live in separate
feature slices (`backup`, `restore`, `connection`), each with its own `presentation/cli/commands/`
folder, so command files are scattered across the source tree rather than sitting in one directory.

How should we build the CLI, and how should commands be discovered?

## Decision Drivers

- Object-oriented style: each command is a class, analogous to an HTTP controller (the main driver)
- Commands are spread across vertical slices, not one `commands/` directory
- Built-in help, flag parsing and validation, to avoid hand-written boilerplate
- Support for lifecycle hooks (the history database must be initialized before any command runs)
- TypeScript and ESM support
- Predictable, explicit wiring that is easy to follow, consistent with the manual composition used
  elsewhere in the project

## Considered Options

- oclif with the default directory-based command discovery (`pattern` strategy)
- oclif with an explicit command registry (`explicit` strategy)
- commander.js
- yargs
- Hand-written argument parsing

## Decision Outcome

Chosen option: "oclif with an explicit command registry", mainly because oclif models every command
as a class extending `Command` (with typed flags and args and a `run()` method). This preserves the
object-oriented style of the project and gives CLI commands the same shape as HTTP controllers. It
also provides parsing, help and hooks out of the box, and the explicit strategy lets commands stay
inside their feature slices.

Commands are registered in `src/bootstrap/commands.ts` as a `COMMANDS` object, referenced from
`package.json` (`oclif.commands.strategy: "explicit"`, `target`, `identifier`). The registry lives
in `bootstrap` because it imports the commands of every slice, which only `bootstrap` is allowed to
do (see [ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md)). The `init` hook
lives in `bootstrap` as well and initializes the application (including the database) before any
command (see [ADR-0003](0003-use-bootstrap-composition-root-with-manual-wiring.md)).

### Consequences

- Good, because commands are classes with a `run()` method, which keeps the codebase object-oriented
  and makes CLI commands structurally similar to HTTP controllers.
- Good, because commands remain co-located with their slice and no directory convention is imposed
  on the source layout.
- Good, because the full list of commands is visible in one file, which fits the
  explicit-composition style of the project.
- Good, because the `init` hook gives one place for initializing the application, including the
  history database.
- Bad, because every new command must be added to `COMMANDS` manually. Forgetting this means the
  command silently does not exist.
- Bad, because oclif loads commands from the compiled `dist/` output, so a build is required before
  the CLI works from the installed `bin`.
- Bad, because the topic separator is a space and `backup:list` is exposed as `casker backup list`,
  which differs from the registry key and can surprise contributors.
- Bad, because oclif is a relatively heavy dependency for a small CLI.

### Confirmation

Review of `commands.ts` when a command is added; `casker --help` lists all registered commands.

## Pros and Cons of the Options

### oclif with directory-based discovery

- Good, because new commands are picked up automatically.
- Bad, because it requires all commands in one directory tree, which conflicts with the
  vertical-slice layout.

### oclif with an explicit registry

- Good, because commands are `Command` subclasses, matching the object-oriented, controller-like
  style.
- Good, because it works with any file layout and keeps wiring visible.
- Good, because of built-in help, flags, hooks and plugin support.
- Bad, because of the manual registration step (see Consequences).

### commander.js

- Good, because it is lightweight and simple.
- Bad, because its API is functional and chain-based (`program.command(...).action(fn)`), with no
  command classes, so it does not fit the object-oriented, controller-like style.
- Bad, because hooks, help structure and topic grouping need more manual work.

### yargs

- Good, because it is mature and flexible.
- Bad, because commands are declared via builder functions and handlers rather than classes, so it
  does not fit the object-oriented, controller-like style.
- Bad, because its TypeScript ergonomics for typed flags are weaker, and it has no hook system
  comparable to oclif's.

### Hand-written parsing

- Good, because it has no dependency.
- Bad, because we would reimplement parsing, validation and help, with no clear benefit.

## More Information

- Registry: `src/bootstrap/commands.ts`
- oclif configuration: `package.json` (`oclif` section)
- Init hook: `src/bootstrap/` (see ADR-0003)
