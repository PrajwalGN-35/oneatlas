# Data Sourcing and Quality

## Source hierarchy

Prefer official model documentation and release notes for identity and capabilities; official provider pricing and availability pages for offerings; official benchmark publications or maintainers for methodology and results; and primary lab announcements for release information. A source URL must be stored with retrieval date, verification date when reviewed, effective date when supplied, publisher, and status.

## Status policy

- `Verified`: checked against an identified source under the current review process.
- `Illustrative`: deliberately synthetic or example content, clearly labeled.
- `Estimated`: derived or approximated with method and uncertainty recorded.
- `Unavailable`: no reliable value is known.

Synthetic data must never be rendered as real-world evidence or included in verified rankings.

## Acquisition workflow

1. Define the fact and acceptance rule.
2. Capture the official source and retrieval timestamp.
3. Record raw claim, normalized value, unit, currency, and effective date.
4. Verify against the source and record reviewer/date.
5. Run validation for required relationships and units.
6. Publish only with status and provenance.
7. Recheck facts on a documented cadence or source-change trigger.
8. Retain historical revisions and mark superseded records.

Automated scraping is non-MVP. Any future automation requires terms-of-use review, source-specific parsing tests, human review, and failure monitoring.

## Quality rules

No benchmark score or price may be fabricated. Preserve benchmark identity, methodology, population, metric, unit, direction, evaluation date, and source. Do not merge creator and provider facts. Do not convert a missing value to zero. Conflicting sources remain visible to reviewers until resolved.

## Operations

Assign ownership for source review, define freshness thresholds by fact type, maintain a review queue, and log changes. Record source access failures and parsing changes. Decide later whether data entry is code-reviewed, admin-managed, or imported through a controlled pipeline.

## Unresolved

Initial source allowlist, benchmark licensing, geographic coverage, pricing currency policy, update cadence, reviewer roles, provenance retention period, and public display of source excerpts require approval.
