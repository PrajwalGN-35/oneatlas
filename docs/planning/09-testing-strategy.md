# Testing Strategy

## Quality gates

Every implementation checkpoint runs formatting/linting, strict type checking through the build, focused tests, and `git diff --check`. Production promotion additionally requires database migration review, accessibility checks, security review, and smoke tests.

## Test layers

- Unit: parsers, validators, normalization, ranking comparability, suitability rules, tie-breaking, and DTO mapping.
- API: status codes, schema validation, pagination, filtering, sorting, malformed IDs, error redaction, and cache behavior.
- Database: constraints, foreign keys, uniqueness, historical revisions, provider-specific pricing, benchmark identity, and transaction behavior.
- Integration: Route Handler to service to Data Access Layer with controlled fixtures.
- End-to-end: discovery, details, comparison, rankings, and suitability flows at mobile and desktop sizes.
- Data quality: provenance completeness, status labels, synthetic-data isolation, stale evidence, and source validation.

## Acceptance criteria

Search results are deterministic for a fixed snapshot; page size and maximum bounds are enforced; no duplicate or missing records appear across adjacent pages under a stable snapshot; comparison preserves missing values; rankings never combine incompatible benchmark methodologies; provider pricing never appears as universal model pricing; mandatory suitability failures cannot pass; unknown mandatory data cannot pass; repeated evaluation is identical.

## Accessibility and responsive checks

Use automated axe-style checks plus keyboard-only journeys, visible focus checks, semantic headings, table headers, form labels, error association, contrast, reduced motion, and screen-reader review of comparison and ranking tables. Test narrow mobile, tablet, desktop, zoom, long names, long source URLs, and partial data.

## Security and performance

Test injection-safe query construction, validation bypass attempts, secret non-disclosure, source URL handling, rate limits when added, dependency audit, and error redaction. Measure p50/p95 response time, database query count, result payload size, build time, and slow-query logging against targets set after baseline traffic exists.

## Test data

Fixtures must state whether values are illustrative or verified. Never use invented prices or benchmark scores as production claims. Include null, unavailable, estimated, conflicting, superseded, and multiple-provider cases.
