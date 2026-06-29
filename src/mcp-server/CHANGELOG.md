# Changelog

All notable changes to the Unicis MCP Server are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Initial Release] — v2026-06-16

### Added
- `unicis_list_tasks` — list tasks with optional filters
- `unicis_get_task` — get full task details
- `unicis_create_task` — create a task
- `unicis_update_task` — update task fields
- `unicis_delete_task` — delete a task
- `unicis_update_task_controls` — manage compliance controls on a task
- `unicis_get_csc_statuses` — get framework control statuses
- `unicis_update_csc_status` — update a control's maturity status
- `unicis_list_api_keys`, `unicis_create_api_key` — API key management
- stdio transport support for Claude Desktop
- Typed API client with automatic `{ data, error }` response unwrapping
- `unicis_add_comment` — post comments on tasks
- `unicis_list_attachments`, `unicis_add_attachment`, `unicis_remove_attachment` — full file attachment management
- `unicis_get_ropa`, `unicis_set_ropa`, `unicis_delete_ropa` — RoPA (Record of Processing Activities) tools
- `unicis_get_tia`, `unicis_set_tia`, `unicis_delete_tia` — TIA (Transfer Impact Assessment) tools
- `unicis_get_pia`, `unicis_set_pia`, `unicis_delete_pia` — PIA/DPIA tools with typed 5-step schema
- `unicis_get_risk`, `unicis_set_risk`, `unicis_delete_risk`, `unicis_list_risks` — Risk Management tools
- Optional `controls` parameter on `unicis_create_task`
- HTTP transport mode alongside existing stdio transport

### Fixed
- `unicis_update_task` — request body now correctly wrapped as `{ data: ... }` matching the platform API
- `unicis_update_csc_status` — corrected field names (`control`, `value`, `framework`) and added required `framework` parameter; response now reads from `resp.data.statuses[controlId]`
- `unicis_get_csc_statuses` — response now correctly unwraps `resp.data.statuses` (was treating response as a plain array)
- `unicis_update_csc_status` — `status` field now validated as a `z.enum` with the exact hyphenated values the platform accepts
- `unicis_get_pia` — fixed property key from `pia_procedure` to `pia_risk`
- `unicis_set_pia` — replaced opaque `nextRisk: object[]` input with fully typed per-step fields (`step0`–`step4`)
- Framework identifiers updated throughout: `mvps` → `mvsp`, `2022` → `iso-2022`, `2013` → `iso-2013`
