---
status: accepted
date: 2026-11-23
decision-makers: StenSOn27
---

# Assemble dependencies in a dedicated bootstrap layer (composition root) with manual wiring

## Context and Problem Statement

Application handlers (for example `CreateBackupCommandHandler`) depend on abstractions from the
domain layer: repositories, engine factories and command executor factories (see
[ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md)). Somewhere in the program,
these abstractions must be bound to concrete implementations and the object graph must be built.

If the presentation layer builds or obtains handlers through code that imports concrete
infrastructure classes, it depends on infrastructure transitively. This contradicts the dependency
direction chosen in ADR-0002 (dependencies point towards the domain) and prevents testing CLI
commands with fake handlers.

Where should the object graph be assembled, and how, so that no layer except the assembling one
knows about concrete implementations?

## Decision Drivers

- Presentation, application and domain must not depend on infrastructure, not even transitively
- CLI commands must be testable with fake handlers
- A single, well-defined place that knows all concrete implementations (composition root)
- Few runtime dependencies for a small CLI distributed via npm
- Wiring errors should be caught at compile time where possible
- oclif instantiates `Command` classes itself, so constructor injection into commands is not
  possible

## Considered Options

- Per-slice `composition/` factory functions called by the presentation layer
- A `bootstrap` composition root with manual wiring (no container)
- A `bootstrap` composition root with a DI container library

## Decision Outcome

Chosen option: "A `bootstrap` composition root with manual wiring (no container)", because it
removes the dependency of presentation on infrastructure without adding a runtime dependency, and
keeps wiring explicit and checked by the TypeScript compiler. The object graph is small enough that
manual wiring is not a burden.

- A dedicated `bootstrap` layer (`src/bootstrap/`) is the composition root. It is the only place
  that knows both abstractions and their concrete implementations, and it creates the concrete
  instances with `new`.
- The oclif `init` hook lives in `bootstrap` and is the entry point of the application code. It
  wires dependencies once at startup, together with the data source initialization, before any
  command runs. `shared/presentation/bin/run.js` is only the launcher that starts oclif.
- Each slice has its own wiring function in `bootstrap` (for example `composeBackup`), called from
  the `init` hook. Instances shared between slices (for example `CommandExecutorFactory`) are
  created once in the hook and passed to these functions.
- Handlers are delivered to oclif commands through a static factory field on the command class (for
  example `CreateBackupCliCommand.createHandler`), typed with the abstract `CommandHandler` /
  `QueryHandler`. `bootstrap` assigns it; the command calls it in `run()` and fails with a clear
  error if it is not configured. A factory function is used instead of a ready instance so that a
  handler is created only when its command actually runs.
- Presentation (CLI commands), application and domain depend only on abstractions and never import
  from `infrastructure` or `bootstrap`.
- `bootstrap` is allowed to depend on every layer of every slice and on `shared`. This is the only
  exception to the isolation rule from ADR-0002.
- Per-slice `composition/` folders imported by presentation are not used.

### Consequences

- Good, because no layer except `bootstrap` depends on infrastructure, which restores the dependency
  direction from ADR-0002.
- Good, because commands depend on abstract handlers, so they can be tested by assigning a fake
  factory to the static field.
- Good, because there is one place to see and change how the application is assembled.
- Good, because there is no extra runtime dependency, no decorators and no `reflect-metadata`
  requirement for wiring.
- Good, because wiring is plain TypeScript, so wrong types or missing constructor arguments are
  compile errors.
- Bad, because every new command needs a line of wiring in `bootstrap`. A forgotten assignment is
  only detected at runtime, when the command runs.
- Bad, because shared instances and lifetimes are managed by hand.
- Bad, because the static field is mutable global state on the command class, so tests must reset
  it.

If manual wiring becomes a burden as the graph grows, switching to a DI container can be
reconsidered in a new ADR. The `bootstrap` boundary stays the same, so the change is local to it.

### Confirmation

Import rules checked in code review (and ideally automated, for example with an ESLint
import-boundaries rule or dependency-cruiser): `presentation`, `application` and `domain` must not
import from `infrastructure` or `bootstrap`; only `bootstrap` may import concrete implementations.

## Pros and Cons of the Options

### Per-slice `composition/` factory functions called by the presentation layer

- Good, because there is no extra dependency and the wiring is explicit and compile-time checked.
- Bad, because presentation depends on infrastructure transitively.
- Bad, because commands cannot receive fake handlers.

### A `bootstrap` composition root with manual wiring

- Good, because there is no extra dependency and wiring stays explicit and compile-time checked.
- Good, because it removes the dependency of presentation on infrastructure.
- Bad, because wiring is written by hand and shared instances and lifetimes are managed manually,
  which scales poorly if the graph grows a lot.

### A `bootstrap` composition root with a DI container library

- Good, because it removes the dependency of presentation on infrastructure and automates wiring and
  lifetimes.
- Bad, because it adds a runtime dependency to a small CLI.
- Bad, because dependencies are resolved at runtime by tokens or names, so wiring errors appear at
  runtime instead of compile time.
- Bad, because many containers rely on legacy decorators and `reflect-metadata`, which must be
  verified in the ESM/TypeScript setup.
- Bad, because a container still does not solve delivery into oclif commands by itself: a global
  container or a similar slot is needed anyway.

## More Information

- Related: [ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md) (layers and
  dependency direction)
- Related: [ADR-0001](0001-use-oclif-with-explicit-command-registry.md) (the oclif `init` hook)
