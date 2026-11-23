# Database Design

This is a conceptual design only. No Prisma schema or migration is created.

## Core entities

- `AILab`: creator identity, canonical slug, name, description, website, status, provenance timestamps.
- `AIModel`: canonical model identity, lab foreign key, slug, name, description, lifecycle status, created/updated timestamps.
- `ModelVersion`: model foreign key, version label, release/effective dates, context and technical attributes, deprecation state.
- `Provider`: serving provider identity, slug, name, website, region/availability metadata.
- `ModelProvider`: model version and provider offering relationship, provider model identifier, availability status, endpoint modality, effective dates.
- `Pricing`: model-provider offering foreign key, billing unit, currency, input/output or other dimensions, amount, effective interval, source and status.
- `Capability`: controlled capability vocabulary; `ModelCapability` joins capability to model version with value and evidence.
- `Modality`: controlled modality vocabulary; `ModelModality` joins modality to model version.
- `Benchmark`: benchmark identity, version, methodology, metric, unit, direction, population, source and dates.
- `BenchmarkResult`: model version and benchmark foreign keys, score representation, evaluated date, evaluation conditions, source, status.
- `DataSource`: canonical URL, publisher, retrieval and verification dates, effective date, status, checksum or citation identifier, notes.
- `WorkloadCategory`: controlled workload definition and version.
- `SuitabilityEvaluation`: versioned input policy, workload, catalog snapshot, created timestamp.
- `SuitabilityResult`: evaluation foreign key, model/provider offering, eligibility, score components, unknowns, explanation, policy version.

## Relationships and integrity

One lab has many models; one model has many versions. One version can have many provider offerings; one provider can serve many versions through `ModelProvider`. Pricing belongs only to a provider-specific offering. Capabilities and modalities join to versions. Benchmarks have many results; each result references one benchmark identity and methodology. Suitability results reference the exact evaluated offering and policy version.

Use surrogate UUID or equivalent stable primary keys, with canonical slugs unique within their entity. Add unique constraints for lab slug, model slug, version identity, provider slug, model-provider version pair, capability and modality names, benchmark identity/version, and source URL where appropriate. Foreign keys should be non-null where relationship is required and use restrictive deletion for historical facts. Use explicit superseded/deprecated states instead of destructive deletion.

## Indexes

Index model status and lab; model/version names; provider offering availability; join foreign keys; pricing effective dates and currency; benchmark identity and evaluated date; source status and verification date; workload and suitability policy version. Add search indexes only after query patterns are measured.

## Historical and provenance requirements

Facts that change require effective intervals or immutable fact revisions. Preserve retrieval date, verification date, source, status, and the methodology that produced a benchmark result. Conflicting sources should coexist with review state rather than overwrite history.

## Data types and unresolved decisions

Use PostgreSQL UUID, text, boolean, numeric for money and scores, timestamptz for events, date for publication/effective dates, JSONB only for bounded methodology or evidence structures that are not queried as core dimensions. Decide later whether money uses minor units or numeric, whether geography is normalized, whether model version is mandatory, and whether source URLs may repeat across facts.

## MVP Implementation Decisions

The following decisions guide the initial Prisma implementation.

### Relationships and provenance

- A model may exist as a draft before its first version is registered.
- Published models must have at least one version; enforce this through application-level validation.
- Every Pricing record must reference a DataSource.
- Every BenchmarkResult must reference a DataSource.
- Verified ModelCapability claims must reference supporting evidence.
- A source may support multiple facts. Canonical source URLs are not globally unique.

### Historical records

- Pricing records are append-only historical facts.
- Benchmark results preserve their original evaluation conditions and methodology.
- Effective dates and record creation timestamps must be preserved.
- Superseded records remain available for historical evaluation.
- Historical facts must not be destructively overwritten.

### Provider offerings

- ModelProvider represents a specific model-version/provider offering.
- Provider availability is represented explicitly.
- Availability is a hard eligibility constraint when required by an evaluation policy.
- Availability must not be counted again as a weighted preference in the same evaluation.

### Suitability reproducibility

- Every evaluation references a versioned policy.
- Every evaluation references a catalog snapshot.
- Catalog snapshots have stable identifiers, capture timestamps and content hashes.
- Every SuitabilityResult references the exact ModelProvider offering evaluated.
- An evaluation with no eligible offerings may return zero results while preserving exclusion explanations.

### Data types and integrity

- Use PostgreSQL UUID identifiers.
- Use NUMERIC for monetary values and comparable numeric scores.
- Store currency and billing units explicitly.
- Use TIMESTAMPTZ for event and audit timestamps.
- Use DATE for publication dates where appropriate.
- Use JSONB only for bounded, structured evidence or methodology that does not require relational querying.
- Use restrictive foreign-key deletion for historical facts.
- Use explicit lifecycle and superseded states.

### Deferred decisions

- Final suitability weights require offline validation.
- Geographic normalization requires further research.
- Pricing conversion and normalization policy requires approval.
- Source review roles and freshness thresholds require operational decisions.
- Authentication requirements remain unresolved.
