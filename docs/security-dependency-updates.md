# Dependency security update — 2026-10-16

Updated both npm projects and removed `npm` from the application's dependencies.
The npm executable supplied by the build/runtime environment is still available;
the application does not import npm as a library. Removing the local dependency
also removes its bundled copies of tar, pacote, sigstore and other packages.

## Scan results

Both scans include development dependencies. Counts represent distinct
package/version/advisory combinations within each project, so a shared dependency
can be counted in both projects. These are lockfile scans, not container scans.

| Project     | Critical before | High before | Critical after | High after |
| ----------- | --------------: | ----------: | -------------: | ---------: |
| Application |               4 |          88 |              0 |          2 |
| MCP server  |               1 |          16 |              0 |          0 |

Scanner versions: Syft 1.54.1 and Grype 0.120.1. Both before/after scans used
the same Grype database, built at `2026-10-16T06:29:51Z` (schema v6.1.10).
No advisory suppressions or `--only-fixed` filtering were used.

## Main changes

- Next.js and eslint-config-next: 16.3.8, restricted to the 16.3 patch line.
- Sharp: 0.35.5, including updated native dependencies.
- Prisma CLI/client/adapter: 7.10.1. Its updated config package uses
  deepmerge-ts 8.0.2, avoiding a forced major override of Prisma's dependency.
- SAML20: 1.22.0, with xml-crypto 6.3.3, xml-encryption 6.0.1 and patched
  xmldom 0.8.15/0.9.12 branches.
- Swagger UI React: 5.33.3, bringing updated Immutable and YAML dependencies.
- Axios: 1.20.0 in both projects.
- MCP SDK: 1.32.1; proxy-addr: 2.0.8.
- Security version floors for the remaining affected transitive dependencies.
  brace-expansion and js-yaml overrides preserve their existing major branches.

## Remaining High advisories

These findings remain visible and are not accepted-risk exceptions.

### node-forge 1.4.0 — GHSA-86w9-cpqp-85rv

[Advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv): RSA PKCS#1 v1.5
signature verification accepts malformed nested DigestAlgorithm elements.
No patched npm release was available at verification time.

The dependency comes from `@boxyhq/saml-jackson`. Static inspection of the installed
Jackson version found its only node-forge import in `dist/saml/x509.js`, where it
generates and signs a local certificate and serializes keys. That module checks
certificate expiration through Node's `crypto.X509Certificate`; no forge signature
verification call was found. XML signature validation uses xml-crypto instead.
This limits the identified exposure but does not remove the affected package.

Next action: adopt a verified upstream release when published, or separately
review a maintained patch/replacement. Do not downgrade to bypass the advisory.

### braces 3.0.3 — GHSA-vfj7-8cjw-p6xm

[Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): stack exhaustion
from deeply nested brace patterns. No patched npm release was available.

The dependency is installed through Jest's micromatch dependency. The application
also imports micromatch in `middleware.ts`, so this cannot be dismissed solely as
a development-only dependency. The middleware passes fixed route patterns to
`isMatch`; the request pathname is the candidate string, not the glob pattern.
No user-controlled pattern was found in those calls.

Next action: adopt a verified upstream fix or review a replacement for affected
pattern-processing paths if their inputs change.

## Reproduce lockfile scans

Run from the repository root with the scanner versions above. Keep a copy of the
database metadata and use the same database for a controlled before/after
comparison; a separate fresh-database scan can identify newly published issues.

```sh
mkdir -p .security-hardening/current
grype db update
grype db status -o json > .security-hardening/current/grype-db-status.json
SYFT_JAVASCRIPT_INCLUDE_DEV_DEPENDENCIES=true syft scan file:package-lock.json \
  -o syft-json=.security-hardening/current/app.sbom.json
SYFT_JAVASCRIPT_INCLUDE_DEV_DEPENDENCIES=true syft scan file:src/mcp-server/package-lock.json \
  -o syft-json=.security-hardening/current/mcp.sbom.json
GRYPE_DB_AUTO_UPDATE=false grype sbom:.security-hardening/current/app.sbom.json \
  -o json > .security-hardening/current/app.grype.json
GRYPE_DB_AUTO_UPDATE=false grype sbom:.security-hardening/current/mcp.sbom.json \
  -o json > .security-hardening/current/mcp.grype.json
```

The committed SPDX and CycloneDX files describe the combined lockfile inventory,
including development dependencies. They do not certify a deployed container.

## Validation and deployment boundary

- Clean `npm ci` for both projects.
- Application lint and type checking.
- Jest: 34 suites and 198 tests passed, with Watchman disabled for this environment.
- MCP TypeScript build and stdio/HTTP initialize/listTools smoke checks (27 tools).
- Signed SAML response validation, rejection of a tampered response,
  XML AES-GCM encrypt/decrypt, and native Sharp PNG processing smoke checks.
- Prisma generation, OpenAPI generation and production build validation.
- Next.js production-server smoke checks: API docs return 200, the root redirects
  with 308, and unauthenticated `/teams` requests redirect with 307.

The production build completed with warnings about Edge Runtime API usage,
deprecated Next.js configuration/conventions and existing i18n/page-data issues.
The middleware redirect was also exercised against the built server.

No database migrations or deployment were performed. The deployed image and its
global npm/OS packages were not scanned. Once access is available, rebuild from
these lockfiles and scan the exact resulting image and production platform.
