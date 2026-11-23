# Architecture Decision Records

## ADR-001: Modular monolith

Status: Proposed. Use one Next.js application with internal DAL, services, Route Handlers, and UI modules. Why: the repository is small, the catalog and evaluator share data, and this avoids premature distributed-system operations. Revisit when independent scaling, ownership, or isolation is demonstrated.

## ADR-002: PostgreSQL

Status: Required by product direction, implementation pending. Use PostgreSQL for relational integrity, joins, historical facts, numeric pricing, and provenance. Why: the domain has many-to-many relationships and audit requirements. Provider, version, connection, backup, and connectivity remain unresolved.

## ADR-003: Prisma with PostgreSQL adapter

Status: Proposed and package-compatible. Use Prisma 7.10.1 with `@prisma/adapter-pg` and `pg`. Verified: installed package engines support Node 24.16.0 and the adapter documents `DATABASE_URL` plus `PrismaPg`. Why: type-safe access and migration tooling fit the TypeScript application. Live connectivity and migration behavior are unverified.

## ADR-004: Next.js Route Handlers

Status: Proposed. Use App Router `route.ts` endpoints with a server-only DAL. Why: this follows installed Next.js guidance and keeps the modular monolith cohesive. Route Handlers are public endpoints, so validation, safe errors, rate limits, and authentication policy must be explicit.

## ADR-005: Separate lab and provider

Status: Required. Model creators and serving providers are separate entities linked through provider-specific offerings. Why: one model may have multiple serving options and pricing must belong to an offering, not the abstract model.

## ADR-006: Provenance and historical facts

Status: Required. Store source, retrieval, verification, effective dates, status, methodology, and revisions. Why: prices, availability, releases, and benchmarks change; users need to assess evidence quality.

## ADR-007: Deterministic suitability

Status: Proposed. Use versioned hard constraints and weighted preferences with explicit unknown handling. Why: explainability, reproducibility, and protection against opaque recommendations. Weights require user research and offline validation.

## ADR-008: Authentication

Status: Unresolved. Public read-only access is a provisional MVP assumption only. Decide whether administration, saved comparisons, submissions, or personalization require authentication before implementing those capabilities.

## ADR-009: Caching

Status: Unresolved by endpoint. Next.js Cache Components is enabled. Choose cache lifetimes based on data freshness and request-specific behavior; do not cache suitability POST responses by default. Validate database-read behavior with integration tests.

## Open decisions

PostgreSQL vendor, connectivity and SSL, pooling, environment ownership, initial data scope, source allowlist, benchmark licensing, pricing normalization, geography, refresh cadence, reviewer roles, test framework, rate limiting, observability, and authentication.
