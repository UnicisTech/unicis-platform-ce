# JSON properties architecture

**Status:** accepted application-level design  
**Scope:** `Task.properties` and `Team.properties`  
**Database changes:** none

Prisma exposes both fields as `Json`, so their TypeScript types alone cannot prove
that data read from the database has the expected shape. The application treats
every raw JSON value as an untrusted boundary and validates known properties
before using them.

## Data flow

```text
API payload                         Prisma Json
    │                                   │
    ▼                                   ▼
request schema                  parser / selector
    │                                   │
    └──────────────┬────────────────────┘
                   ▼
             typed module value
                   │
                   ▼
       immutable writer inside a
       Serializable transaction
                   │
                   ▼
          one properties update
```

The implementation is split by responsibility:

| Responsibility                                               | Location                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| Runtime schemas for stored module values and API bodies      | `lib/properties/schemas/`                                 |
| Parse a complete JSON object and report invalid known values | `lib/properties/task-properties.ts`, `team-properties.ts` |
| Read one module value or narrow a `Task`                     | `lib/properties/selectors.ts`                             |
| Build a new JSON object without mutating the input           | `lib/properties/writers.ts`                               |
| Serialize read-modify-write operations and retry conflicts   | `models/properties.ts`, `lib/prisma-transaction.ts`       |
| Module-specific business rules and audit diffs               | `models/rpa.ts`, `tia.ts`, `pia.ts`, `rm.ts`, `csc.ts`    |
| Return consistent API validation errors                      | `lib/api-validation.ts`                                   |

## Read rules

1. At a Prisma, API, or serialized DTO boundary, keep `properties` as `unknown`
   or Prisma JSON and read it through a selector such as `getPiaRisk` or
   `getTeamCscIso`.
2. When several fields are needed, call `parseTaskProperties` or
   `parseTeamProperties` once and use the returned `properties` object.
3. For task collections, filter with a narrowing guard such as
   `taskHasRmRisk`. Direct access is then allowed on the resulting
   `TaskWithRmRisk`; reparsing in every table cell or export row is unnecessary.
4. Do not cast raw JSON with `as TaskProperties` or `as TeamProperties`.
   ESLint rejects those assertions outside the properties boundary.
5. Invalid known properties are omitted from the typed result and described in
   `issues`. Unknown keys are retained so that one module cannot erase data
   owned by another module or by a newer application version.

`getTeamAccess` is itself a read boundary: its `teamProperties` value has
already passed through `parseTeamProperties`, so consumers may read that parsed
object directly.

## Write rules

1. Validate external payloads with a module-specific request schema before
   calling a model. A generic task update must not accept `data.properties`.
2. The model receives only the next validated module value. Client-supplied
   `prev*` values may be used for presentation or analytics, but never as the
   source of truth for persistence or audit history.
3. Run JSON read-modify-write operations through a helper in
   `models/properties.ts`. It uses a Prisma `Serializable` transaction and
   retries Prisma `P2034` conflicts up to three attempts.
4. Inside the transaction, read the previous module value with a selector and
   create the next object with `setTaskProperty`, `deleteTaskProperty`,
   `appendTaskAuditLogs`, or `setTeamProperty`.
5. Write the module change and its audit entries as one properties update.
   Never mutate the Prisma object in place and never perform a second update
   just for the audit log.

These rules prevent a stale request from silently overwriting an unrelated
module update. They also ensure that an audit diff reflects the value actually
stored in the database at the start of the transaction.

## Compatibility rules

- Stored property names and payload shapes remain unchanged. This architecture
  does not require a Prisma schema migration or a JSON data migration.
- PIA accepts the legacy four-step payload at the input boundary and normalizes
  it to the canonical five-slot tuple.
- TIA validates both supported short and full procedures.
- CSC selectors can read the legacy `csc_controls` key, while new writes use
  framework-specific keys.
- The canonical PIA key is `pia_risk`; new code must not use `pia_procedure`.

## Adding a property or module

Before a new key is used in production:

1. Add its stored TypeScript type and include it in `TaskProperties` or
   `TeamProperties`.
2. Add a runtime schema and register it in the corresponding parser.
3. Add selectors and, for task lists, a narrowing guard and `TaskWith…` type.
4. If it is a task module, add the key to `taskModuleKeys` and handle it in
   `hasTaskModule` / `getTaskModules`.
5. Add an API request schema and call `validateApiRequestBody` in every write
   route, including MCP-backed routes.
6. Persist through the shared immutable writers and atomic model helper.
7. Test valid, missing, malformed, and unknown-property cases, plus create,
   update, delete, and audit behavior.
8. Update OpenAPI and module documentation.

## Deferred database work

The following are possible future projects, not part of the current design and
not approved implicitly by this document:

- **Database default and check constraint.** Setting `properties` to an empty
  JSON object by default and enforcing `jsonb_typeof(properties) = 'object'`
  would require a Prisma/SQL schema migration and a check of existing rows.
- **JSON schema versions.** A `schemaVersion` key is only useful once stored
  shapes need versioned readers. Introducing it for existing records would
  require a separately planned data backfill; no version key or backfill is
  added now.
- **Relational audit log.** A `TaskAuditLog` table can be introduced through a
  Prisma schema migration. A safe rollout would define the table and indexes,
  decide whether old JSON audit entries are backfilled, deploy dual-read or
  dual-write compatibility if needed, and only then stop writing JSON logs.
  This deserves its own retention, querying, and rollout design.
- **Different storage shape.** A future design could use a module-keyed envelope
  or dedicated columns/tables instead of encoding module ownership in names
  such as `pia_risk`. Existing property names are intentionally unchanged now;
  adopting another shape would be an explicit migration project.
