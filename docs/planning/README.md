# OneAtlas.dev Planning Package

Status: planning only. No application features, dependencies, database state, schemas, or migrations are changed by this package.

## Evidence labels

- **Verified**: observed in the repository or installed package documentation.
- **Assumption**: temporary planning premise requiring confirmation.
- **Recommendation**: proposed design choice, not an external fact.
- **Hypothesis**: product or market belief requiring validation.
- **Unresolved**: decision intentionally deferred.

## Documents

1. [Repository Audit](01-repository-audit.md)
2. [Product Requirements](02-product-requirements.md)
3. [UX and Information Architecture](03-ux-information-architecture.md)
4. [Feature Specifications](04-feature-specifications.md)
5. [Database Design](05-database-design.md)
6. [API Contracts](06-api-contracts.md)
7. [Suitability Engine](07-suitability-engine.md)
8. [Data Sourcing and Quality](08-data-sourcing-quality.md)
9. [Testing Strategy](09-testing-strategy.md)
10. [Deployment Strategy](10-deployment-strategy.md)
11. [Implementation Roadmap](11-implementation-roadmap.md)
12. [Architecture Decision Records](12-architecture-decision-records.md)

## Gate before implementation

Implementation must wait for decisions on authentication, PostgreSQL connectivity and hosting, initial data scope, benchmark licensing, pricing currency and normalization, refresh ownership, and suitability weight validation. See [Architecture Decision Records](12-architecture-decision-records.md).
