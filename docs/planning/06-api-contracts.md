# API Contracts

Use Next.js App Router Route Handlers under `src/app/api/**/route.ts` and a server-only Data Access Layer. These are proposed contracts, not implemented endpoints.

## Common rules

Responses use `{ data, meta, errors }`, with `errors` omitted or empty on success. Pagination uses validated `page` and `pageSize`; default and maximum values must be fixed in implementation. Sort fields are allow-listed. IDs and enum filters are validated before database access. Internal errors never expose SQL, credentials, or stack traces.

## Endpoints

`GET /api/models`: query `q`, `labId`, `providerId`, `capability`, `modality`, `status`, `workload`, `page`, `pageSize`, `sort`, `direction`. Returns model summaries, applied filters, and pagination.

`GET /api/models/:id`: returns model identity, versions, offerings, pricing, capabilities, modalities, benchmarks, sources, and timestamps. Returns 400 for malformed ID and 404 for absent model.

`GET /api/labs` and `GET /api/labs/:id`: search/filter/paginate labs; detail returns models and provenance. Same 400/404 conventions.

`GET /api/providers` and `GET /api/providers/:id`: search/filter/paginate providers; detail returns model offerings, availability, pricing, and source status.

`GET /api/benchmarks`: query benchmark, methodology, model, date, status, page, pageSize. Returns benchmark definitions and result summaries with comparability metadata.

`GET /api/rankings`: query benchmark, methodology, workload, modality, provider, date, sort, page, pageSize. Returns a ranking only within a compatible benchmark slice and includes exclusions and caveats.

`GET /api/compare`: query repeated `modelId` values, optional provider context, and field groups. Reject fewer than two, duplicates, unknown IDs, or more than the maximum.

`POST /api/suitability/evaluate`: JSON body contains workload category/version, mandatory requirements, optional preferences, provider constraints, pricing assumptions, and requested candidate scope. Returns policy version, catalog snapshot, candidate outcomes, failures, unknowns, score breakdowns, and explanations. Returns 422 for semantically invalid input.

## Status codes

200 success; 400 malformed request; 404 missing resource; 405 unsupported method; 409 conflicting state where applicable; 422 valid JSON with invalid domain values; 429 only if rate limiting is introduced; 500 unexpected server failure; 503 unavailable data dependency. Define a stable machine-readable error code.

## Responsibilities

Route Handlers parse and validate HTTP input, call application services, map errors, and serialize DTOs. Application services own business rules and suitability orchestration. The Data Access Layer owns Prisma queries, authorization boundary, field minimization, and transaction boundaries. UI components do not call Prisma directly.

## Caching and security

GET cache policy is endpoint-specific because Next.js Cache Components and database reads interact. Public catalog reads may receive a documented revalidation policy after freshness requirements are known. POST evaluation is request-time and not cached by default. Authentication remains unresolved; public read-only is provisional. Apply rate limits, query bounds, safe errors, and source URL validation before production exposure.
