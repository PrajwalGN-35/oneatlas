# Product Requirements

## Vision

OneAtlas.dev helps technical users discover, understand, compare, evaluate, and decide among AI models using transparent capability, provider, pricing, benchmark, and provenance information.

## Problem

Model information is distributed across laboratory pages, provider catalogs, pricing pages, release notes, and benchmark publications. Users need a consistent comparison context without treating incomplete or methodologically different evidence as directly equivalent.

## Audiences

- Developers choosing a model and provider for an application.
- AI/ML researchers investigating model capabilities and evidence.
- Technical decision-makers comparing deployment options and tradeoffs.

Audience needs and pain points are product assumptions until validated through interviews and usage data.

## Value proposition

A structured, source-linked model intelligence catalog that makes differences, uncertainty, and tradeoffs visible rather than hiding them behind one opaque score.

## Differentiation hypothesis

Users may prefer a catalog that combines model identity, provider-specific offerings, provenance, benchmark methodology, and explainable workload suitability in one workflow. This is a hypothesis, not a verified competitor claim, and requires market validation.

## MVP scope

- Public model, lab, provider, capability, modality, pricing, benchmark, and source records.
- Search, filtering, sorting, pagination, model details, side-by-side comparison, rankings with methodology labels, and deterministic workload evaluation.
- Clear data status, source links, retrieval dates, effective dates, and missing-data treatment.
- Responsive accessible UI and documented REST-style Route Handler contracts.

## Non-MVP

Authentication and saved workspaces; user submissions; model hosting or inference; provider brokering; automated web scraping; real-time benchmark execution; personalized recommendations; billing; agentic research; native mobile applications.

## Functional requirements

FR-1 Users can search and filter models by lab, provider availability, modality, capability, context information, data status, and workload-relevant attributes.

FR-2 Users can inspect model identity, versions, capabilities, modalities, provider offerings, pricing, benchmark results, sources, and update dates.

FR-3 Users can compare a bounded set of models with aligned fields and explicit unavailable values.

FR-4 Rankings expose the benchmark identity, methodology, population, dates, source, and comparability limitations.

FR-5 Suitability evaluation separates mandatory failures from weighted preferences and explains every result.

FR-6 All public facts that can change have provenance and status.

## Non-functional requirements

Accessible keyboard navigation and semantic structure; deterministic evaluation; server-side secret isolation; safe input validation; observable API errors; bounded query cost; responsive layouts; auditable data changes; repeatable tests.

## Success metrics

Initial metrics are recommendations: successful discovery sessions, detail-page engagement, comparison completion, evaluation completion, source-link usage, search zero-result rate, latency percentiles, accessibility defect rate, and data freshness coverage. Targets require baseline traffic and research before being set.

## Product limitations

Coverage will be incomplete. Benchmark results may not be comparable. Pricing changes and provider availability can become stale. Suitability is decision support, not a guarantee of application performance. Unknown values must remain unknown.
