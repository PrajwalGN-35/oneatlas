# Implementation Roadmap

Follow Plan -> Implement -> Test -> Fix -> Commit -> Document. Each phase requires approval of its acceptance criteria before moving on.

## Phase 0: foundation verification

Objective: confirm runtime, PostgreSQL connectivity, environment handling, Prisma generation path, and test tooling. Expected files: environment documentation, Prisma configuration, server-only database client, test configuration. Dependencies: approved architecture and credentials. Tests: connection health, build, lint, secret isolation. Acceptance: connection works in local and staging without exposing credentials. Risks: provider, pooling, and Prisma configuration mismatch.

## Phase 1: domain and schema

Objective: implement the approved normalized model. Expected files: Prisma schema and migrations, database module, seed strategy. Dependencies: [Database Design](05-database-design.md) approval and source policy. Tests: constraints, migrations, fixtures, rollback rehearsal. Acceptance: model/provider separation, historical facts, pricing ownership, and benchmark provenance are enforced. Risks: ambiguous version identity and changing requirements.

## Phase 2: data access and contracts

Objective: implement DAL, DTOs, validators, services, and requested Route Handlers. Expected files: `src/lib`, `src/app/api`, validation and service modules. Dependencies: schema and API approval. Tests: API contract, authorization boundary, pagination, errors, query plans. Acceptance: all listed endpoints meet [API Contracts](06-api-contracts.md). Risks: unbounded queries and cache mistakes.

## Phase 3: discovery and detail UX

Objective: implement Home, Discovery, Model Details, Labs, and Providers. Expected files: route pages, UI components, styles, loading/error boundaries. Dependencies: API contracts and illustrative fixtures. Tests: search/filter, responsive, keyboard, accessibility, empty/error states. Acceptance: discover and understand journeys work with partial data.

## Phase 4: comparison and evidence

Objective: implement Comparison, Benchmarks, and Rankings. Expected files: comparison and evidence views plus services. Dependencies: benchmark methodology and provenance rules. Tests: comparability, missing values, stable ordering, table accessibility. Acceptance: no unsupported cross-methodology ranking and every displayed result has evidence status.

## Phase 5: suitability engine

Objective: implement the versioned deterministic evaluator. Expected files: policy types, evaluator, API integration, result UI. Dependencies: validated workload requirements and provisional weights. Tests: hard constraints, unknowns, normalization, determinism, explanations. Acceptance: mandatory failure and unknown handling are correct and reproducible.

## Phase 6: data operations and release

Objective: establish source review, imports, monitoring, backups, and production release. Expected files: runbooks, import tooling if approved, CI workflow, documentation. Dependencies: verified data policy and hosting decisions. Tests: import validation, smoke, restore rehearsal, security and performance. Acceptance: release checklist is executable and provenance/freshness metrics are visible.

## Checkpoint discipline

Each checkpoint must record changed files, dependency status, test output, acceptance result, risks, and documentation updates. Do not begin authentication, inference, model hosting, or agents without a separately approved requirement and ADR.
