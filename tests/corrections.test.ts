import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/services/catalog", () => ({
  catalogService: {
    listModels: vi.fn(async () => ({ data: [], meta: {} })),
    listLabs: vi.fn(async () => ({ data: [], meta: {} })),
    listProviders: vi.fn(async () => ({ data: [], meta: {} })),
    listBenchmarks: vi.fn(async () => ({ data: [], meta: {} })),
    compare: vi.fn(async (ids: string[], providerId?: string) => ({ data: ids.map((id) => ({ id, providerContext: providerId ? { providerId, status: "UNAVAILABLE", offerings: [] } : undefined })), meta: { providerId: providerId ?? null } })),
    rankings: vi.fn(async () => ({ data: { benchmark: {}, ranking: [], exclusions: [] }, meta: {} })),
  },
}));

import { GET as modelsGet } from "../src/app/api/models/route";
import { GET as benchmarksGet } from "../src/app/api/benchmarks/route";
import { GET as rankingsGet } from "../src/app/api/rankings/route";
import { GET as compareGet } from "../src/app/api/compare/route";

describe("Route Handler parameter behavior", () => {
  it("rejects workload on models", async () => {
    const response = await modelsGet(new Request("http://localhost/api/models?workload=coding"));
    expect(response.status).toBe(400);
  });

  it("rejects repeated model scalar parameters", async () => {
    const response = await modelsGet(new Request("http://localhost/api/models?q=a&q=b"));
    expect(response.status).toBe(400);
  });

  it("rejects benchmark methodology and date filters", async () => {
    const methodology = await benchmarksGet(new Request("http://localhost/api/benchmarks?methodology=stdio"));
    expect(methodology.status).toBe(400);
    const date = await benchmarksGet(new Request("http://localhost/api/benchmarks?date=2026-01-01"));
    expect(date.status).toBe(400);
  });

  it("rejects unsupported ranking filters", async () => {
    const response = await rankingsGet(new Request("http://localhost/api/rankings?benchmark=test&modality=text"));
    expect(response.status).toBe(400);
  });

  it("requires benchmark for rankings", async () => {
    const response = await rankingsGet(new Request("http://localhost/api/rankings"));
    expect(response.status).toBe(400);
  });

  it("allows repeated modelId parameters in comparison", async () => {
    const a = "123e4567-e89b-12d3-a456-426614174000";
    const b = "123e4567-e89b-12d3-a456-426614174001";
    const response = await compareGet(new Request(`http://localhost/api/compare?modelId=${a}&modelId=${b}`));
    expect(response.status).toBe(200);
  });

  it("rejects repeated provider context in comparison", async () => {
    const a = "123e4567-e89b-12d3-a456-426614174000";
    const b = "123e4567-e89b-12d3-a456-426614174001";
    const provider = "123e4567-e89b-12d3-a456-426614174002";
    const response = await compareGet(new Request(`http://localhost/api/compare?modelId=${a}&modelId=${b}&provider=${provider}&provider=${provider}`));
    expect(response.status).toBe(400);
  });
});
