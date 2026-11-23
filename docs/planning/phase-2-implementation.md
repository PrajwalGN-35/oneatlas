# Phase 2 Implementation Record

## Architecture

Phase 2 uses the Next.js modular-monolith boundaries approved for the project:

- Route Handlers parse and validate HTTP requests.
- Application services coordinate business rules and DAL calls.
- The catalog DAL owns bounded Prisma queries and relation selection.
- Zod and shared query helpers validate UUIDs, scalar repeats, enums, pagination and sorting.
- Stable API envelopes are returned by shared response helpers.
- Centralized handlers redact internal failures and normalize Prisma availability failures.

## Endpoints

- `GET /api/models`: supports `q`, `labId`, `providerId`, `capability`, `modality`, `status`, `page`, `pageSize`, `sort`, `direction`. Sorting uses `name`, `createdAt`, or `updatedAt`. `workload` is explicitly rejected with HTTP 400 because the current schema has no model/workload relationship.
- `GET /api/models/:id`: returns model identity, lab, versions, provider offerings, provider-specific pricing, capabilities, modalities, benchmark results, sources and timestamps.
- `GET /api/labs`: supports `q`, `status`, `page`, `pageSize`, `sort`, `direction`. Sorting uses `name`, `createdAt`, or `updatedAt`.
- `GET /api/labs/:id`: returns lab identity, provenance and bounded models.
- `GET /api/providers`: supports `q`, `status`, `page`, `pageSize`, `sort`, `direction`. Sorting uses `name`, `createdAt`, or `updatedAt`.
- `GET /api/providers/:id`: returns provider identity, bounded offerings, availability history and provider-specific pricing.
- `GET /api/benchmarks`: supports `q`, `benchmark`, `model`, `status`, `page`, `pageSize`, `sort`, `direction`. `methodology` and `date` are explicitly rejected with HTTP 400.
- `GET /api/compare`: repeated `modelId` parameters and optional single `provider`. Requires 2–10 distinct valid models. Unknown models and providers produce safe structured failures. Provider context is preserved and models without an offering show explicit `UNAVAILABLE` provider context.
- `GET /api/rankings`: requires `benchmark` by ID or slug and supports optional `provider`, `page`, `pageSize`, `sort` (`scoreValue` or `evaluatedAt`) and `direction`. `methodology`, `modality`, `date`, `status`, and `workload` are explicitly rejected with HTTP 400.

## Shared contracts

Success: `{"data": {}, "meta": {}, "errors": []}`.

Failure: `{"data": null, "meta": null, "errors": [{"code": "VALIDATION_ERROR", "message": "A safe error message"}]}`.

Pagination defaults to page 1 and page size 20. Maximum page size is 100. Navigation metadata includes total records, total pages, next and previous flags.

Repeated scalar query parameters are rejected. Repeated `modelId` values remain allowed only for comparison. Unknown parameters are rejected.

## Domain and evidence behavior

- Pricing belongs to a specific provider/model offering.
- AI Labs and Providers remain separate domain concepts.
- Missing values remain `null` or empty collections; unknowns are not converted to zero.
- Capability filtering accepts only `VERIFIED` capability claims with an evidence source.
- Detail and comparison responses preserve evidence status and result/definition source records.
- Rankings require an exact benchmark ID or slug. They preserve benchmark version, metric, unit, direction, population, methodology and definition source.
- Ranking results require `VERIFIED` result evidence and a matching benchmark definition.
- `ILLUSTRATIVE`, `UNVERIFIED`, `ESTIMATED`, `UNAVAILABLE`, `CONFLICTED`, and `SUPERSEDED` benchmark results are not returned as verified ranking evidence.
- `TARGET_RANGE` benchmarks are returned as non-orderable with an explicit exclusion reason rather than being ranked by ordinary ascending or descending assumptions.
- Ranking exclusion counts are database counts bounded to the selected benchmark/provider context.

## Stability and bounded reads

All list queries use bounded offsets and stable secondary ID ordering where applicable. Ranking queries use database pagination and deterministic ties. Nested detail collections remain bounded by explicit relation limits. Live database metadata must be checked against those limits during UI integration.

## Testing

Vitest covers response envelopes, safe error redaction, structured API failures, pagination boundaries, sort allowlists, UUIDs, repeated and unsupported parameters, ranking directions, TARGET_RANGE behavior, and Route Handler parameter behavior.

Route Handler tests use mocked application services. No live-database integration fixture suite is presently implemented, so live PostgreSQL behavior remains a limitation rather than a claimed test result.

## Known limitations

- No safe, isolated PostgreSQL fixture suite is included. Existing development data must not be reset or truncated.
- Benchmark methodology and date filters require a documented normalized query representation and are therefore rejected until approved.
- Workload filtering has no model/workload relationship in the Prisma schema and is rejected rather than fabricated.
- Ranking provider filters require a provider to exist and otherwise return 404.
- Nested relation limits can truncate detail collections; clients must treat the nested collection limits as bounded views.
- Caching and rate limiting remain deferred; public production exposure requires an approved policy.
