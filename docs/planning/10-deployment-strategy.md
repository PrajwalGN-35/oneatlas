# Deployment Strategy

## Proposed architecture

Recommendation: deploy the Next.js modular monolith to Vercel or an equivalent Node-compatible platform and use managed PostgreSQL. Evaluate Neon alongside other managed PostgreSQL alternatives against connection pooling, branching or preview workflows, regions, backups, recovery, cost, operational controls, and Prisma compatibility. Prisma Client with `@prisma/adapter-pg` is the proposed data access layer. This is a recommendation, not a claim that a particular provider is selected.

## Environment strategy

Separate local, preview, staging, and production environments. Keep `DATABASE_URL` server-only and never prefix it with `NEXT_PUBLIC_`. Store secrets in the platform secret manager; commit only a safe environment template after implementation. Next.js loads `.env*` from the project root, not `src/`. PostgreSQL connectivity, SSL mode, pooling, and provider remain pending verification.

## Database lifecycle

Create a Prisma schema and migrations only after this plan is approved. Review migrations, apply them in staging, run integrity checks, then apply production migrations with a rollback plan. Seed data must be explicitly illustrative or sourced and verified. Do not use destructive reset commands in shared environments.

## Deployment sequence

1. Validate build and tests.
2. Validate environment configuration without printing secrets.
3. Apply reviewed migration to staging.
4. Seed controlled data and run integrity checks.
5. Run API and UI smoke tests.
6. Promote the same commit to production.
7. Apply migration under an approved window.
8. Verify health, key queries, provenance displays, and error monitoring.

## Security and operations

Use least-privilege database credentials, TLS, restricted connection access, secret rotation, dependency scanning, safe error responses, rate limits for public endpoints, and audit logs for data changes. Monitor request errors, latency, database pool exhaustion, slow queries, migration failures, and stale-data coverage. Backups and point-in-time recovery must be confirmed with the selected provider.

## Rollback

Prefer backward-compatible migrations. Roll back application code independently where possible; use corrective migrations for data changes. Define restore procedures and test them before production. A database rollback is not assumed to be safe for destructive changes.

## Unresolved decisions

Hosting provider, PostgreSQL vendor and plan, connection pooling strategy, regions, backup retention, monitoring vendors, deployment approvals, preview database policy, and production data import process.
