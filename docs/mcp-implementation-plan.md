# Unicis Platform — MCP Server Integration Plan

> **Status:** Draft · **Date:** 2026-03-12 · **Branch:** `feat/mcp-server`

---

## 1. Executive Summary

This plan describes how to expose Unicis Platform's GRC capabilities (Controls, PIA, RPA, TIA, Risk Management, IAP, Tasks) as an **MCP (Model Context Protocol) server**. Once integrated, AI assistants (Claude Desktop, Claude Code, LM Studio, OpenWebUI) can interact with Unicis data through natural language — querying compliance status, creating risk records, running gap analyses, and generating reports — all through secure, auditable API calls.

### Business value
- AI-assisted GRC workflows: "What controls are failing for ISO 27001?" → instant answer
- Cross-framework gap analysis in one prompt
- Automated evidence collection from connected cloud/SaaS tools (Phase 3)
- Natural-language risk register management
- Audit-ready interaction log via existing Retraced integration

---

## 2. Architecture Overview

### Transport: stdio (recommended)

Following the same approach used by CISO Assistant and GigaChad-GRC, the MCP server will run as a **local subprocess** using `stdio` transport.

```
┌─────────────────────┐      stdio      ┌──────────────────────────┐      HTTPS      ┌───────────────────────┐
│   AI Client         │◄───────────────►│  unicis-mcp-server       │◄───────────────►│  Unicis Platform API  │
│  (Claude Desktop /  │                 │  (Node.js/TypeScript)    │                 │  (Next.js REST API)   │
│   Claude Code CLI)  │                 │                          │                 │  localhost:4002       │
└─────────────────────┘                 │  - Tool definitions      │                 │  or remote instance   │
                                        │  - Request validation    │                 └───────────────────────┘
                                        │  - Auth via API key      │
                                        └──────────────────────────┘
```

**Why stdio over HTTP:**
- No open ports on the developer's machine
- API key travels only between local MCP server and Unicis API
- AI client spawns the MCP server as a subprocess — no separate daemon
- Aligns with existing Unicis API key authentication model
- Simpler to run in offline/air-gapped environments

### Alternative: Streamable HTTP transport (Phase 2+)

For multi-user / SaaS deployment, the MCP server can be exposed as an HTTP server (SSE or WebSocket), with each team authenticating via their own API key.

---

## 3. Repository Structure

Create a new package (monorepo-ready) or standalone repo:

```
unicis-mcp-server/
├── src/
│   ├── index.ts                  # Entry point, MCP server setup
│   ├── client.ts                 # Unicis API HTTP client (wraps fetch)
│   ├── auth.ts                   # API key loading & validation
│   ├── tools/
│   │   ├── index.ts              # Tool registry
│   │   ├── tasks.ts              # Task CRUD tools
│   │   ├── csc.ts                # Controls & compliance tools
│   │   ├── pia.ts                # Privacy Impact Assessment tools
│   │   ├── rpa.ts                # Record of Processing Activity tools
│   │   ├── tia.ts                # Third-party Assessment tools
│   │   ├── risk.ts               # Risk Management tools
│   │   ├── iap.ts                # Training & awareness tools
│   │   └── team.ts               # Team & member tools
│   ├── resources/
│   │   ├── index.ts              # MCP resource registry
│   │   ├── frameworks.ts         # Compliance frameworks as resources
│   │   └── reports.ts            # SOA & summary report resources
│   └── prompts/
│       ├── index.ts              # Prompt templates registry
│       ├── gap-analysis.ts       # Gap analysis prompt template
│       └── risk-report.ts        # Risk summary prompt template
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

**If co-located in the platform repo**, place under `/packages/mcp-server/` and reference from root `package.json` workspaces.

---

## 4. Authentication

Unicis Platform already has a working **API key system** (`/api/teams/[slug]/api-keys`). The MCP server will use this directly.

### Configuration (environment variables)

```env
UNICIS_API_URL=http://localhost:4002        # or production URL
UNICIS_API_KEY=uk_live_xxxxxxxxxxxx         # Team API key from Unicis settings
UNICIS_TEAM_SLUG=your-team-slug            # Target team identifier
VERIFY_TLS=true                             # Set false for local dev self-signed certs
```

### How the MCP server authenticates

```
Authorization: Bearer <UNICIS_API_KEY>
```

All requests include this header. The existing `throwIfNoTeamAccess` and `throwIfNotAllowed` guards on each API route enforce RBAC automatically — an AUDITOR API key can only read, an ADMIN key can create/update.

---

## 5. MCP Tools Catalog

### 5.1 Task Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `list_tasks` | GET | `/api/teams/{slug}/tasks` | List tasks with optional status/date filters |
| `get_task` | GET | `/api/teams/{slug}/tasks/{taskNumber}` | Get full task detail including all GRC properties |
| `create_task` | POST | `/api/teams/{slug}/tasks` | Create a new task/work item |
| `update_task` | PUT | `/api/teams/{slug}/tasks/{taskNumber}` | Update task status, title, or description |
| `add_comment` | POST | `/api/teams/{slug}/tasks/{taskNumber}/comments` | Add a comment to a task |

### 5.2 Controls & Compliance (CSC) Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `list_frameworks` | GET | `/api/teams/{slug}/csc` | List available compliance frameworks |
| `get_framework_controls` | GET | `/api/teams/{slug}/csc/{iso}` | Get controls for a specific framework |
| `get_task_controls` | GET | `/api/teams/{slug}/tasks/{taskNumber}/csc` | Get control statuses for a task |
| `update_control_status` | PUT | `/api/teams/{slug}/tasks/{taskNumber}/csc` | Update control implementation status |
| `get_compliance_summary` | GET | `/api/teams/{slug}/csc` | Aggregate compliance posture across all tasks |

**Supported frameworks:** ISO 27001:2013, ISO 27001:2022, GDPR, NIST CSF v2, EU NIS2, CIS v8.1, SOC 2 v2, C5:2020, OWASP ASVS v5, MVSP

### 5.3 Privacy Impact Assessment (PIA) Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `get_pia` | GET | `/api/teams/{slug}/tasks/{taskNumber}/pia` | Get PIA data for a task |
| `update_pia` | PUT | `/api/teams/{slug}/tasks/{taskNumber}/pia` | Update risk ratings, necessity scores, residual risk |
| `list_high_risk_pias` | GET | `/api/teams/{slug}/tasks` | Query tasks with high PIA risk scores (filtered client-side) |

### 5.4 Record of Processing Activity (RPA) Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `get_rpa` | GET | `/api/teams/{slug}/tasks/{taskNumber}/rpa` | Get GDPR Article 30 record |
| `update_rpa` | PUT | `/api/teams/{slug}/tasks/{taskNumber}/rpa` | Update data categories, retention, recipients |
| `list_rpas` | GET | `/api/teams/{slug}/tasks` | List all tasks that have RPA records |

### 5.5 Third-party Integration Assessment (TIA) Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `get_tia` | GET | `/api/teams/{slug}/tasks/{taskNumber}/tia` | Get vendor/integration assessment |
| `update_tia` | PUT | `/api/teams/{slug}/tasks/{taskNumber}/tia` | Update risk scores and findings |
| `list_tias` | GET | `/api/teams/{slug}/tasks` | List all TIA assessments |

### 5.6 Risk Management (RM) Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `get_risk` | GET | `/api/teams/{slug}/tasks/{taskNumber}/rm` | Get risk data for a task |
| `update_risk` | PUT | `/api/teams/{slug}/tasks/{taskNumber}/rm` | Update likelihood, impact, mitigation |
| `list_risks` | GET | `/api/teams/{slug}/tasks` | Query risk register (filter by severity) |
| `get_risk_summary` | — | computed | Aggregate risk matrix across all tasks |

### 5.7 Training & Awareness (IAP) Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `list_courses` | GET | `/api/teams/{slug}/iap/course` | List available training courses |
| `get_course` | GET | `/api/teams/{slug}/iap/course/{courseId}` | Get course details |
| `get_course_progress` | GET | `/api/teams/{slug}/iap/course/{courseId}/progress` | Get team completion rates |

### 5.8 Team Tools

| Tool name | Method | Endpoint | Description |
|---|---|---|---|
| `get_team` | GET | `/api/teams/{slug}` | Get team details and settings |
| `list_members` | GET | `/api/teams/{slug}/members` | List team members and their roles |

---

## 6. MCP Resources

Resources allow AI clients to subscribe to live data (e.g., always-fresh compliance posture).

| Resource URI | Description |
|---|---|
| `unicis://teams/{slug}/frameworks` | List of enabled compliance frameworks |
| `unicis://teams/{slug}/risk-register` | Full risk register as structured JSON |
| `unicis://teams/{slug}/soa/{framework}` | Statement of Applicability for a framework |
| `unicis://teams/{slug}/pia-report` | Aggregated PIA report |
| `unicis://teams/{slug}/rpa-report` | GDPR Article 30 register |

---

## 7. MCP Prompt Templates

Pre-built prompt templates that AI clients can invoke with parameters:

| Prompt | Parameters | Output |
|---|---|---|
| `gap_analysis` | `framework`, `scope` | Structured gap analysis against a compliance framework |
| `risk_report` | `severity_threshold` | Risk register summary with recommended mitigations |
| `gdpr_readiness` | — | GDPR readiness assessment across all RPA/PIA records |
| `control_remediation` | `framework`, `control_id` | Step-by-step remediation guidance for a failing control |

---

## 8. Implementation Phases

### Phase 1 — Core MCP Server (Read-only) ✅ MVP

**Goal:** AI clients can query and read all Unicis GRC data.

**Tasks:**
- [ ] Scaffold MCP server package (TypeScript, `@modelcontextprotocol/sdk`)
- [ ] Implement API client (`client.ts`) with API key auth and error handling
- [ ] Implement `list_tasks`, `get_task` tools
- [ ] Implement `list_frameworks`, `get_framework_controls` tools
- [ ] Implement `get_pia`, `get_rpa`, `get_tia`, `get_risk` tools
- [ ] Implement `list_members` tool
- [ ] Wire stdio transport in `index.ts`
- [ ] Add `UNICIS_API_URL`, `UNICIS_API_KEY`, `UNICIS_TEAM_SLUG` env loading
- [ ] Write `.env.example`
- [ ] Test with Claude Desktop and Claude Code CLI
- [ ] Document installation and configuration in `README.md`

**Client config (Claude Desktop):**
```json
{
  "mcpServers": {
    "unicis": {
      "command": "npx",
      "args": ["unicis-mcp-server"],
      "env": {
        "UNICIS_API_URL": "http://localhost:4002",
        "UNICIS_API_KEY": "uk_live_xxxxxxxxxxxx",
        "UNICIS_TEAM_SLUG": "your-team"
      }
    }
  }
}
```

**Client config (Claude Code CLI — `.mcp.json`):**
```json
{
  "mcpServers": {
    "unicis": {
      "type": "stdio",
      "command": "node",
      "args": ["./packages/mcp-server/dist/index.js"],
      "env": {
        "UNICIS_API_URL": "http://localhost:4002",
        "UNICIS_API_KEY": "uk_live_xxxxxxxxxxxx",
        "UNICIS_TEAM_SLUG": "your-team"
      }
    }
  }
}
```

---

### Phase 2 — Write Operations + Resources + Prompts

**Goal:** AI clients can create/update GRC records and access live resources.

**Tasks:**
- [ ] Implement `create_task`, `update_task`, `add_comment` tools
- [ ] Implement `update_control_status` tool
- [ ] Implement `update_pia`, `update_rpa`, `update_tia`, `update_risk` tools
- [ ] Add input validation (Zod schemas) for all write tools
- [ ] Implement MCP Resources: `risk-register`, `soa/{framework}`, `pia-report`, `rpa-report`
- [ ] Implement MCP Prompt templates: `gap_analysis`, `risk_report`, `gdpr_readiness`
- [ ] Hook write operations into existing Retraced audit log (log MCP-originated changes)
- [ ] Add role-aware error messages (surface RBAC errors clearly to AI client)
- [ ] Write integration tests against local Unicis instance

**Audit logging strategy:**
When a write tool is called, include `source: mcp` in the Retraced event actor metadata so operators can distinguish AI-initiated actions from human UI actions in the audit log.

---

### Phase 3 — Compliance Evidence Collection (External MCP Servers)

**Goal:** Connect external cloud/SaaS MCP servers to feed evidence directly into Unicis control records.

**Approach:** Use a **router/orchestrator** pattern — Claude reads from external MCP servers (AWS, GitHub, Okta) and writes collected evidence into Unicis via the Phase 1/2 tools.

**Candidate external MCP servers:**
| Source | What to collect | Maps to Unicis control |
|---|---|---|
| `@aws/mcp-server` | IAM policies, S3 bucket ACLs, CloudTrail logs, GuardDuty findings | CSC access control / logging controls |
| `github/mcp-server` | Branch protection rules, SAST scan results, dependency alerts | CSC secure development controls |
| `@okta/mcp-server` | MFA enrollment rates, inactive accounts, admin role assignments | CSC identity & access management |
| `@azure/mcp-server` | Resource policies, Defender alerts | CSC cloud security controls |
| Slack MCP | Incident channel activity | RPA / incident records |

**Tasks:**
- [ ] Define evidence schema (how external findings map to Unicis control statuses)
- [ ] Create `ingest_evidence` composite tool that accepts structured evidence and updates relevant controls
- [ ] Document orchestration prompts (e.g., "Collect AWS evidence and update ISO 27001 controls in Unicis")
- [ ] Add evidence provenance tracking (store source, collected_at, raw data in task properties JSON)

---

### Phase 4 — HTTP Transport + Multi-tenant Deployment

**Goal:** Offer the MCP server as an always-on HTTP endpoint for SaaS customers.

**Tasks:**
- [ ] Add Streamable HTTP transport alongside stdio
- [ ] Route per-team authentication (`/mcp/{team-slug}` path or API key → slug lookup)
- [ ] Add rate limiting (per API key, reuse existing Unicis rate limiting patterns)
- [ ] Add OpenTelemetry tracing for MCP calls (reuse existing `OTEL_*` env vars)
- [ ] Deploy as a separate service or integrate into Next.js app under `/api/mcp/`
- [ ] Update client configs for remote HTTP endpoint

---

## 9. Security Considerations

| Concern | Mitigation |
|---|---|
| API key exposure | Keys stored in env vars only; never logged or returned in tool responses |
| Privilege escalation | RBAC enforced by Unicis API itself; MCP server is just a thin client |
| Prompt injection via GRC data | Tool responses return structured JSON, not rendered HTML; validate all inputs with Zod |
| Audit trail | All write operations tagged `source: mcp` in Retraced audit log |
| Token scope | Recommend dedicated API keys for MCP with minimum required role (MEMBER for read-only, ADMIN for write) |
| Data residency | stdio transport: data never leaves the local machine except to the configured `UNICIS_API_URL` |

---

## 10. Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "zod": "^3.23.8",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.x",
    "tsx": "^4.x"
  }
}
```

The `@modelcontextprotocol/sdk` version must be verified against the MCP spec version targeted (currently 2025-03-26).

---

## 11. Acceptance Criteria

### Phase 1
- [ ] `npx unicis-mcp-server` starts without error given valid env vars
- [ ] Claude Desktop can ask "List all tasks" and receive a structured response
- [ ] Claude Desktop can ask "What is the ISO 27001:2022 compliance status?" and get control summaries
- [ ] All read tools return correctly shaped data matching Prisma model types
- [ ] Server handles API errors gracefully (401, 403, 404, 429) with clear messages

### Phase 2
- [ ] Claude can create a new task and it appears in the Unicis UI
- [ ] Write operations appear in the Retraced audit log with `source: mcp`
- [ ] Gap analysis prompt returns a structured, actionable markdown report
- [ ] RBAC violations surface as clear tool error messages, not unhandled exceptions

---

## 12. References

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [CISO Assistant MCP Setup Guide](https://intuitem.gitbook.io/ciso-assistant/integration/mcp-setup-guide)
- [GigaChad-GRC MCP Quick Start](https://github.com/grcengineering/gigachad-grc/blob/main/docs/guides/mcp-quick-start.md)
- [CISO's Guide to AI Agent MCP (LinkedIn)](https://www.linkedin.com/pulse/cisos-guide-ai-agent-model-context-protocol-mcp-powell-cissp-cism-pngac/)
- Unicis Platform API routes: `/pages/api/teams/[slug]/`
- Unicis API key management: `/pages/api/teams/[slug]/api-keys/`
- Unicis audit logging: `/lib/retraced.ts`
