# Model Intelligence and Suitability Engine

## Goal

Provide deterministic, explainable decision support for Coding, Reasoning, Summarization, Document Analysis, Image Understanding, and General Chat. The engine evaluates catalog facts; it does not run inference or claim application performance.

## Evaluation stages

1. Validate the versioned request policy.
2. Select candidate model-provider offerings.
3. Apply hard constraints.
4. Mark mandatory requirements as pass, fail, or unknown.
5. Exclude any candidate with a mandatory fail or unknown where the policy requires proof.
6. Normalize eligible optional evidence.
7. Calculate weighted score components.
8. Emit evidence, unknowns, exclusions, and a plain-language explanation.

Unknown data never counts as a successful requirement. A mandatory failure cannot be overridden by a high weighted score.

## Constraint examples

Mandatory constraints may include required modality, documented context threshold, provider availability, region, licensing flag, minimum verified capability, and maximum normalized price. Optional preferences may include benchmark evidence, lower price, latency evidence if available, broader modality, or preferred provider.

## Provisional scoring

Initial recommendation, pending user research and offline validation: capability fit 30%, benchmark evidence 20%, provider availability 15%, price fit 15%, modality fit 10%, evidence freshness 10%. These weights are policy data, not truth. A policy version must make changes reproducible.

Scores must be calculated only from comparable values. Normalize price by a declared unit and currency conversion policy; do not compare incomparable billing units. Preserve raw and normalized values.

## Output

Return policy version, timestamp, catalog snapshot, candidate status, hard-constraint results, weighted components, total score where eligible, missing data, source references, and explanation. Explain both inclusion and exclusion. Never phrase a ranking as a guarantee.

## Determinism

Use stable identifiers, explicit rounding, fixed tie-breaking, immutable policy versions, and a catalog snapshot or effective timestamp. Same request, policy, and data snapshot must produce the same output.

## Edge cases and tests

Test mandatory unknown, mandatory fail, high-score hard failure, all candidates excluded, no provider offering, currency unavailable, zero versus null price, stale evidence, benchmark direction, ties, duplicate candidates, and policy-version changes. Property tests should verify that adding an unrelated candidate cannot change an existing candidate's component score.
