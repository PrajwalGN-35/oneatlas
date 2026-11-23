# UX and Information Architecture

## Navigation

Primary navigation: Home, Discover, Compare, Rankings, AI Labs, Providers, Suitability. Model details are reached from cards, tables, rankings, labs, providers, and comparison links. Preserve filters in URL query parameters so views are shareable and back navigation is useful.

## Home

Purpose: orient users and start the core journey. Structure: concise value statement, search entry, workload shortcuts, recently updated evidence, and links to discovery and rankings. Loading uses skeleton regions; empty states explain that the catalog has no matching published data; errors offer retry and direct navigation. Mobile uses a single-column flow. Keyboard focus, heading order, labels, contrast, and reduced-motion behavior are required.

## Model Discovery

Purpose: find candidates. Main actions: search, filter, sort, paginate, clear filters, open details, select for comparison. Structure: query input, filter controls, result count, result list/table, pagination. Debounce client search where appropriate but treat URL and server validation as authoritative. Show unavailable values explicitly. Loading preserves the result frame; no-results distinguishes no matches from data failure.

## Model Details

Purpose: understand one model and its offerings. Hierarchy: identity and lab, version timeline, capabilities/modalities, provider offerings and provider-specific pricing, benchmarks with methodology, sources and freshness, limitations. Provider entries link to provider details; benchmark entries link to source context. Responsive sections stack; tables scroll horizontally without hiding critical labels.

## Model Comparison

Purpose: compare a bounded candidate set. Require at least two selected models and enforce a documented maximum. Align fields by category, show missing values as unavailable, preserve provider context, and link each value to provenance where practical. On small screens use category tabs or a transposed table. Empty and invalid selections explain how to add models.

## Rankings and Benchmarks

Purpose: inspect benchmark evidence, not an absolute universal leaderboard. Require benchmark, methodology, population, date, and source context near the ranking. Warn when values are not comparable. Loading and error states preserve filter context. Use accessible tables with captions and scope headers.

## AI Labs and Providers

Each index supports search, filters, pagination, and detail links. Lab details emphasize model creators; provider details emphasize offerings, availability, endpoints as documented facts, pricing, and regions where verified. Never merge those identities.

## Suitability Evaluation

Purpose: evaluate a workload. Form sections: workload, mandatory requirements, preferences, provider and pricing constraints, and output explanation. Validate ranges and incompatible inputs. Results show pass, fail, unknown, score components, excluded candidates, evidence, and caveats. A mandatory failure cannot be hidden by a high score.

## Cross-cutting states

Every data view needs loading, empty, partial-data, validation-error, server-error, and unavailable-evidence states. Never imply that an empty value is zero. Use semantic HTML, visible focus, labels, error association, table semantics, accessible names for controls, logical landmarks, and a responsive layout tested at mobile and desktop widths.
