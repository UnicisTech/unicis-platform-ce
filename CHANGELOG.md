# Changelog

All notable changes to Unicis Platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — mcp branch

### Added
- **MCP Server** — the [Unicis MCP Server](https://github.com/UnicisTech/unicis-mcp-server) is now available as a companion open-source repository, enabling AI assistants (Claude, Cursor, VS Code Copilot, and any MCP-compatible client) to interact with Unicis Platform through natural language. Covers tasks, RoPA, TIA, PIA, cybersecurity controls, risk management, file attachments, comments, and API key management.

### Fixed

#### Framework identifier corrections (breaking for stored data — migration required)
- Renamed internal framework key `mvps` → `mvsp` everywhere in the codebase (types, mappings, hooks, models, locale files, migration helpers, OpenAPI spec)
- Renamed internal framework keys `2022` → `iso-2022` and `2013` → `iso-2013` everywhere (types, mappings, hooks, components, locale files, OpenAPI spec)
- Renamed i18n locale files to match new keys: `locales/{en,es,fr}/csc/mvps.json` → `mvsp.json`, `2013.json` → `iso-2013.json`, `2022.json` → `iso-2022.json`
- Renamed framework source files: `lib/csc/frameworks/mvps.ts` → `mvsp.ts`, `lib/csc/frameworks-migration/mvps.ts` → `mvsp.ts`
- Updated `RadarChart` ISO comparison from `'2013'` to `'iso-2013'`
- Updated `getServerSideProps` CSC translation namespace list to use `csc/mvsp`, `csc/iso-2013`, `csc/iso-2022`
- Updated MVSP display name from `'MVSP v1.0-20211007'` to `'MVSP'` in `CSC_FRAMEWORK_TO_NAME`

#### Database migration
- Added `scripts/migrations/2026-06-16-framework-key-rename-migration.ts` — renames JSON property keys in `Team.properties` (`csc_statuses_mvps` → `csc_statuses_mvsp`, `csc_statuses_2022` → `csc_statuses_iso-2022`, `csc_statuses_2013` → `csc_statuses_iso-2013`, `csc_iso` array values) and `Task.properties` (`csc_controls_mvps` → `csc_controls_mvsp`, `csc_controls_2022` → `csc_controls_iso-2022`, `csc_controls_2013` → `csc_controls_iso-2013`), and fixes `rpa_procedure[4].toms` values (`mvps` → `mvsp`)
- Run with: `npx tsx scripts/migrations/2026-06-16-framework-key-rename-migration.ts`
