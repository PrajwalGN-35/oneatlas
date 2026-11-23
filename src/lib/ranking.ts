export function compareRankValues<
  T extends { scoreValue: bigint | number | string },
>(
  a: T,
  b: T,
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER" | "TARGET_RANGE",
) {
  const left = Number(a.scoreValue);
  const right = Number(b.scoreValue);
  if (direction === "LOWER_IS_BETTER") return left - right;
  if (direction === "HIGHER_IS_BETTER") return right - left;
  return 0;
}

export function benchmarkRankPolicy(direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER" | "TARGET_RANGE") {
  if (direction === "TARGET_RANGE") {
    return { orderable: false, scoreDirection: null, reason: "TARGET_RANGE_NOT_ORDERABLE" };
  }
  return {
    orderable: true,
    scoreDirection: direction === "LOWER_IS_BETTER" ? "asc" as const : "desc" as const,
    reason: null,
  };
}
