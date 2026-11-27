---
status: accepted
date: 2026-11-24
decision-makers: StenSOn27
---

# Separate command handlers and query handlers in the application layer with generic abstractions

## Context and Problem Statement

The application layer contains the use cases of Casker: creating a backup, restoring one, checking a
connection and listing the backup history. Some of them change state (they create backup files,
write to the history or restore a database), and others only read data (listing the history,
checking a connection).

How should use cases be structured, so that the application layer has a uniform, type-checked shape,
and so that it is clear which use cases change state and which only read?

## Decision Drivers

- A single standard for the application layer: every use case is invoked in the same way
- Type checking of the input and the result without extra effort
- A clear distinction between use cases that change state and use cases that only read
- Presentation must be able to depend on abstractions, so that it can be tested with fake handlers
  (see [ADR-0003](0003-use-bootstrap-composition-root-with-manual-wiring.md))

## Considered Options

- Separate `CommandHandler` and `QueryHandler` abstractions (the Command-Query Separation pattern),
  generic over the input and the result
- Service classes with arbitrary methods (for example a `BackupService` with `create()` and
  `list()`)
- A single generic use-case abstraction without the command and query distinction
- A mediator or bus that dispatches commands and queries to handlers

## Decision Outcome

Chosen option: "Separate `CommandHandler` and `QueryHandler` abstractions, generic over the input
and the result", because it gives a uniform contract for all use cases, the compiler checks inputs
and results immediately, and the separation between state-changing and read-only use cases is
explicit.

- `CommandHandler<TCommand, TResult extends Id | void = void>` and `QueryHandler<TQuery, TResult>`
  are abstract classes in `shared/application/handlers/`. Each declares one method,
  `handle(input): Promise<TResult>`. This is the standard signature for every handler in the
  application layer. `Id` is a shared type for identifiers.
- A handler states its input and result types when it implements the abstraction. For example,
  `CreateBackupCommandHandler implements CommandHandler<CreateBackupCommand, string>` (it returns
  the id of the backup) and
  `ListBackupQueryHandler implements QueryHandler<ListBackupQuery, BackupListItem[]>`.
- Commands and queries are plain data objects that live in each slice (`application/commands/`,
  `application/queries/`) next to their handlers.
- A command handler changes state: it creates a backup, restores a database or writes to the
  history. Its result is either the `Id` of the affected entity or nothing (`void`). The type
  argument is constrained to `Id | void`, so a command cannot return any other data, and this is
  checked by the compiler rather than kept by convention. Returning the identifier of a created
  entity is an accepted practice in Command-Query Separation, so commands are not required to return
  nothing. A command reports failure by throwing.
- A query handler only reads and returns data. It must not change state. Listing the backup history
  and checking a connection are queries.
- Callers (the CLI commands) depend on the abstract `CommandHandler` and `QueryHandler` types, not
  on the concrete handler classes.

### Consequences

- Good, because every use case has the same entry point and signature, so the application layer is
  predictable and easy to navigate.
- Good, because the generics are checked by the compiler at the implementation and at the call site,
  so a wrong input or result type is a compile error.
- Good, because the code shows which use cases change state and which are safe to call repeatedly.
- Good, because callers depend on the abstractions, so presentation can be tested with fake
  handlers.
- Bad, because the separation is a convention. The compiler does not check that a query handler does
  not change state, and both abstractions have the same shape, so the difference between them is
  only semantic.
- Bad, because callers invoke handlers directly, without a bus or a pipeline, so cross-cutting
  concerns such as validation or logging are not handled in one place.

### Confirmation

Code review: every use case in the application layer implements `CommandHandler` or `QueryHandler`
with explicit type arguments, and query handlers do not write to the history or to external systems.

## Pros and Cons of the Options

### Separate `CommandHandler` and `QueryHandler` abstractions

- Good, because of the uniform contract, compile-time checks and the explicit read-write separation
  (see Decision Outcome).
- Bad, because the separation is by convention and the compiler does not enforce it (see
  Consequences).

### Service classes with arbitrary methods

- Good, because there are fewer classes.
- Bad, because each service has its own method names and signatures, so there is no standard for the
  application layer.
- Bad, because callers depend on larger, less focused types, and it is not visible which methods
  change state.

### A single generic use-case abstraction without the command and query distinction

- Good, because it is a uniform contract with even less structure.
- Bad, because it does not show which use cases change state and which only read.

### A mediator or bus that dispatches commands and queries to handlers

- Good, because cross-cutting concerns can be added in one place and callers do not know about
  handlers at all.
- Bad, because it adds indirection and, usually, a dependency, which is more than a small CLI needs.

## More Information

- Abstractions: `src/shared/application/handlers/CommandHandler.ts`,
  `src/shared/application/handlers/QueryHandler.ts`
- Examples: `src/backup/application/commands/CreateBackupCommandHandler.ts`,
  `src/backup/application/queries/ListBackupQueryHandler.ts`
- Related: [ADR-0002](0002-use-vertical-slices-with-clean-architecture-layers.md) (the application
  layer inside each slice)
- Related: [ADR-0003](0003-use-bootstrap-composition-root-with-manual-wiring.md) (callers depend on
  the abstract handlers)
