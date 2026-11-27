# Specification: Backup List

- **Status:** Implemented (retrospective spec), with planned changes marked **[Planned]**
- **Author:** StenSOn27
- **Date:** 2026-11-24

## 1. Context and Problem

Every `casker backup` attempt, successful or failed, is recorded in a local history. Users need a way to look at that history: which backups exist, whether they succeeded, how big they are and why a failed one failed. `casker backup list` shows this history in a readable table for people, or as JSON for scripts.

## 2. Goals and Non-Goals

**Goals:**

- Show the most recent backup attempts, newest first.
- Filter by status and by database type.
- Show all matching entries on request.
- Provide machine-readable JSON output with the full data.
- **[Planned]** Reject invalid flag values with a clear error instead of silently producing wrong results.

**Non-Goals:**

- Creating, deleting or modifying history entries.
- Checking that the backup file still exists on disk.
- Filtering by database name, date range or size.
- Pagination or interactive browsing.
- Restoring from the listed entries (planned as a separate `restore` feature, see section 8).

## 3. Functional Requirements

- **FR-1:** The command is `casker backup list` and accepts the flags listed in section 4. All flags are optional.
- **FR-2:** By default, the command shows the 10 most recent entries, ordered by creation time, newest first.
- **FR-3:** `--limit <n>` (`-l`) sets the maximum number of entries shown.
- **FR-4:** `--status <value>` (`-s`) shows only entries with the given status (`success` or `failed`).
- **FR-5:** `--driver <value>` (`-d`) shows only entries for the given database type (for example `postgresql`).
- **FR-6:** `--status` and `--driver` can be combined; an entry must match both.
- **FR-7:** **[Planned]** `--all` shows all entries that match the filters, ordered newest first, and ignores `--limit`. Currently `--all` ignores `--status` and `--driver` and does not sort; this is a defect to fix.
- **FR-8:** **[Planned]** The command validates its flags before reading the history:
  - `--status` must be one of `success`, `failed`.
  - `--driver` must be one of the supported database types.
  - `--limit` must be a positive integer.
  - On an invalid value the command prints an error that names the flag and the allowed values, and exits with a non-zero code. Currently no validation is done.
- **FR-9:** Table output (default) prints one line per entry with these columns, without headers: short ID (first 8 characters of the UUID), status (`success` in green, `failed` in magenta), size, database type, creation time (UTC string), database name.
- **FR-10:** Size is formatted in decimal units: `<n> B` below 1000 bytes, `<n.n> KB` below 1 000 000, otherwise `<n.n> MB`.
- **FR-11:** For a failed entry that has an error message, an extra line `error: <message>` is printed under it.
- **FR-12:** If there are no matching entries, the table output prints `No backups found.` and exits with code `0`.
- **FR-13:** `--json` (`-j`) prints the entries as a JSON array instead of the table. Each item contains the full `id`, `driverType`, `filePath`, `sizeBytes`, `status`, `name`, `createdAt` and, if present, `errorMessage`. With no matching entries it prints `[]`.
- **FR-14:** The short ID in the table and the full ID and file path in JSON are intentional: the table is compact for people, JSON carries complete data for scripts.

## 4. Interface

```
casker backup list [-l <n>] [--all] [-s <success|failed>] [-d <driver>] [-j]
```

| Flag       | Short | Default | Description                       |
| ---------- | ----- | ------- | --------------------------------- |
| `--limit`  | `-l`  | `10`    | Max entries to show               |
| `--all`    |       | off     | Show all entries                  |
| `--status` | `-s`  | -       | Filter by status                  |
| `--driver` | `-d`  | -       | Filter by database type           |
| `--json`   | `-j`  | off     | Output as JSON                    |

Examples:

```
casker backup list
casker backup list -l 5 -s failed
casker backup list --all -d postgresql
casker backup list --json
```

Table output:

```
3f2b8c1e  success  12.4 MB  postgresql  Tue, 24 Nov 2026 12:00:00 GMT  shop
a91d04b7  failed   0 B      postgresql  Tue, 24 Nov 2026 11:40:12 GMT  shop
  error: pg_dump exited with code 1
```

JSON output:

```json
[
  {
    "id": "3f2b8c1e-...",
    "driverType": "postgresql",
    "filePath": "backups/postgresql-shop-2026-11-24T12-00-00-000Z.dump",
    "sizeBytes": 12400000,
    "status": "success",
    "name": "shop",
    "createdAt": "2026-11-24T12:00:00.000Z"
  }
]
```

Exit behavior: exit code `0` on success (including an empty result); non-zero with an error message on invalid flags **[Planned]**.

## 5. Data Model

No changes. The command only reads `BackupResult` entries stored through `BackupResultRepository`.

## 6. Solution Design

Flow: oclif command `ListBackupCliCommand` -> `createListBackupHandler()` (composition) -> `ListBackupQueryHandler` -> `BackupResultRepository` (`find(limit, status, driver)` or `getAll()`) -> mapped to `BackupListItem` objects -> formatted by the CLI command as a table (`columnify`) or JSON.

Key decisions:

- **Query handler returns plain items.** The handler maps domain entities to `BackupListItem`, so the CLI layer only formats and never touches the domain entity.
- **Presentation differs by audience.** The table is short and colored for people; JSON is complete and stable for scripts.
- **[Planned] One repository path.** Filters and ordering should apply the same way with and without `--all`, so `--all` should be "no limit", not "a different query".

## 7. Edge Cases and Error Handling

| Situation                                   | Expected behavior                                                     |
| ------------------------------------------- | --------------------------------------------------------------------- |
| History is empty                            | Table: `No backups found.`; JSON: `[]`; exit code `0`                |
| Filters match nothing                       | Same as empty history                                                 |
| `--all` together with `--status` / `--driver` | **[Planned]** Filters apply, result sorted newest first             |
| `--all` together with `--limit`             | **[Planned]** `--limit` is ignored                                    |
| `--status foo`                              | **[Planned]** Error naming the flag and allowed values; non-zero exit |
| `--driver foo`                              | **[Planned]** Error naming the flag and allowed values; non-zero exit |
| `--limit 0`, negative or non-integer        | **[Planned]** Error; non-zero exit                                    |
| Failed entry without an error message       | No `error:` line is printed                                           |

## 8. Open Questions

- **Short ID vs. restore by ID.** The table shows only the first 8 characters of the ID, while restore by ID (planned) will need an identifier. Decide whether restore should accept a unique ID prefix, only the full ID (available in `--json`), or whether the table should show more.
- **Upper bound for `--limit`.** Whether `--limit` should have a maximum, or whether any positive integer is accepted and `--all` is the way to see everything.
- **Validation messages for `--driver`.** The allowed values come from the supported database types. Decide whether planned but not yet implemented types (MySQL, MariaDB, MongoDB) are accepted as filters, since history entries for them cannot exist yet.

## 9. Acceptance Criteria

- [ ] `casker backup list` shows at most 10 entries, newest first.
- [ ] `-l 3` shows at most 3 entries.
- [ ] `-s failed` shows only failed entries, each with its error line.
- [ ] `-d postgresql` shows only entries of that type; combined with `-s` both filters apply.
- [ ] `--all` shows every entry that matches the filters, newest first. **[Planned]**
- [ ] `--json` prints a valid JSON array with the full ID and file path; an empty result prints `[]`.
- [ ] With no matching entries, table output prints `No backups found.` and exits with `0`.
- [ ] `-s foo`, `-d foo` and `-l 0` fail with a clear error and a non-zero exit code. **[Planned]**
