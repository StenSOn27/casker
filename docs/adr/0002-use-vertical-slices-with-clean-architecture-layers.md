---
status: accepted
date: 2026-11-22
decision-makers: StenSOn27
---

# Use vertical slices with Clean Architecture layers inside each slice

## Context and Problem Statement

Casker supports several independent use cases (`backup`, `restore`, `connection`) and is expected to
grow: more databases, more features, more delivery mechanisms. We need a code organization that
keeps features isolated, keeps dependencies under control and stays easy to change as the system
grows.

How should the source code be structured at the top level, and how should it be structured inside
each feature?

## Decision Drivers

- Isolation of features: a module should not know about other modules
- Low coupling between parts of the system
- High cohesion: code that changes together lives together
- Scalability and ease of changing the system
- Dependencies pointing in one direction, towards the domain

## Considered Options

- Horizontal layers across the whole project (`controllers/`, `services/`, `repositories/`, ...)
- Vertical slices (one module per feature) with a flat structure inside each slice
- Vertical slices with Clean Architecture layers inside each slice

## Decision Outcome

Chosen option: "Vertical slices with Clean Architecture layers inside each slice", because it
combines feature isolation at the top level with controlled dependency direction inside each
feature.

**Top level: vertical slices.** `src/` is divided into `backup`, `restore`, `connection`, `shared`
and `bootstrap`. Slices are isolated: they do not know about each other and depend only on `shared`,
which holds common services, interfaces and structures (`CommandExecutor`, `ConnectionConfig`, base
handlers, errors). This keeps each feature self-contained, so it can be understood, changed or
removed with minimal impact on the rest.

**Top level: `bootstrap`.** `bootstrap` is the composition root and the entry point of the
application code: it contains the oclif `init` hook, which assembles dependencies by binding
abstractions to concrete implementations and initializes the application before any command runs
(see [ADR-0003](0003-use-bootstrap-composition-root-with-manual-wiring.md)). `bootstrap` is not a
feature slice and is the only place allowed to depend on all slices, their layers (including
`infrastructure`) and `shared`. No slice depends on `bootstrap`. The connection to the SQLite
history database (see [ADR-0007](0007-use-node-sqlite-for-backup-history.md)) also lives in
`bootstrap`, because it is created once at startup and shared by all slices; slice repositories
receive the connection from `bootstrap` through their constructors and never import it.
`shared/presentation/bin/run.js` is only the launcher that starts oclif.

**Inside each slice: Clean Architecture layers.**

- `domain/`: entities, errors, abstract factories and interfaces. It depends on nothing.
- `application/`: commands, queries and handlers (use cases). It depends on `domain`.
- `infrastructure/`: implementations of domain interfaces (engines, builders, repositories,
  persistence). It depends on `domain` and `application`.
- `presentation/`: delivery mechanism (currently `cli/`). It depends on `application`.

Dependencies point inward towards the domain, so business logic does not depend on frameworks,
databases or the delivery mechanism. This gives low coupling between layers and high cohesion within
each layer and each slice.

### Consequences

- Good, because features are isolated: changes to one slice rarely affect another.
- Good, because dependencies point towards the domain, which lowers coupling and lets infrastructure
  and presentation be replaced independently.
- Good, because code that changes together is grouped by feature, which raises cohesion.
- Good, because the structure scales by adding slices or implementations rather than modifying
  existing code.
- Bad, because there is more structure (folders, interfaces, factories) than a small CLI strictly
  needs, which costs boilerplate and a learning curve.
- Bad, because the isolation rule has to be maintained by discipline. Nothing in the tooling
  enforces it yet.
- Bad, because anything needed by several slices must be moved to `shared`, which can turn into a
  dumping ground if not kept small.

### Confirmation

Code review of imports: a slice may import only from itself and from `shared`, and a layer only from
itself and the layers inside it. The only exception is `bootstrap`, which may import from every
slice. An automated check (for example an ESLint import-boundaries rule or dependency-cruiser) could
enforce this but is not set up yet.

## Pros and Cons of the Options

### Horizontal layers across the whole project

- Good, because it is familiar and simple for small projects.
- Bad, because one feature is spread over many directories, which lowers cohesion.
- Bad, because every feature shares the same layers, so coupling between features grows over time.

### Vertical slices with a flat structure inside each slice

- Good, because features are isolated and the structure is simple.
- Bad, because nothing controls the dependency direction inside a slice, so business logic can end
  up depending on infrastructure details.

### Vertical slices with Clean Architecture layers

- Good, because of feature isolation and controlled dependency direction.
- Good, because domain and application code are independent of frameworks and I/O.
- Bad, because of additional structure and indirection (see Consequences).

## More Information

- Slices: `src/backup`, `src/restore`, `src/connection`, `src/shared`
- Composition root and entry point: `src/bootstrap` (contains the oclif `init` hook;
  `src/shared/presentation/bin/run.js` only launches oclif)
- Related: [ADR-0001](0001-use-oclif-with-explicit-command-registry.md) (oclif commands live in each
  slice's `presentation/cli/`)
- Related: [ADR-0003](0003-use-bootstrap-composition-root-with-manual-wiring.md) (composition root
  with manual wiring)
