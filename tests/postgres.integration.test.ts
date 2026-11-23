import { config as loadEnv } from "dotenv";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { catalogDal } from "../src/lib/dal/catalog";
import { catalogService } from "../src/lib/services/catalog";
import { GET as getModels } from "../src/app/api/models/route";
import { GET as getModel } from "../src/app/api/models/[id]/route";
import { GET as getCompare } from "../src/app/api/compare/route";
import { GET as getRankings } from "../src/app/api/rankings/route";

loadEnv({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
const prefix = `oneatlas_it_${Date.now()}_${randomUUID().slice(0, 8)}`;

const ids = {
  lab: "",
  providerA: "",
  providerB: "",
  modelA: "",
  modelB: "",
  versionA: "",
  versionB: "",
  offeringA: "",
  offeringB: "",
  source: "",
  benchmarkHigher: "",
  benchmarkTarget: "",
  benchmarkResultVerified: "",
  benchmarkResultUnverified: "",
  benchmarkResultTarget: "",
  pricing: "",
  availability: "",
};

async function assertPrefixIsUnused() {
  const records = await Promise.all([
    prisma.aILab.findUnique({
      where: { slug: `${prefix}_lab` },
      select: { id: true },
    }),
    prisma.provider.findUnique({
      where: { slug: `${prefix}_provider_a` },
      select: { id: true },
    }),
    prisma.provider.findUnique({
      where: { slug: `${prefix}_provider_b` },
      select: { id: true },
    }),
    prisma.aIModel.findUnique({
      where: { slug: `${prefix}_model_a` },
      select: { id: true },
    }),
    prisma.aIModel.findUnique({
      where: { slug: `${prefix}_model_b` },
      select: { id: true },
    }),
    prisma.benchmark.findUnique({
      where: { slug_version: { slug: `${prefix}_higher`, version: "1" } },
      select: { id: true },
    }),
    prisma.benchmark.findUnique({
      where: { slug_version: { slug: `${prefix}_target`, version: "1" } },
      select: { id: true },
    }),
    prisma.dataSource.findFirst({
      where: { canonicalUrl: `https://example.invalid/${prefix}/source` },
      select: { id: true },
    }),
  ]);
  if (records.some(Boolean))
    throw new Error(
      "Synthetic integration fixture prefix already exists; refusing to write",
    );
}

async function createFixtures() {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const source = await prisma.dataSource.create({
    data: {
      canonicalUrl: `https://example.invalid/${prefix}/source`,
      publisher: "OneAtlas synthetic integration fixture",
      retrievedAt: now,
      verifiedAt: now,
      effectiveDate: now,
      status: "VERIFIED",
    },
  });
  ids.source = source.id;
  const [lab, providerA, providerB, capability, modality] =
    await prisma.$transaction([
      prisma.aILab.create({
        data: {
          slug: `${prefix}_lab`,
          name: "Synthetic Integration Lab",
          status: "ACTIVE",
        },
      }),
      prisma.provider.create({
        data: {
          slug: `${prefix}_provider_a`,
          name: "Synthetic Provider A",
          regionCodes: ["ZZ"],
          status: "ACTIVE",
        },
      }),
      prisma.provider.create({
        data: {
          slug: `${prefix}_provider_b`,
          name: "Synthetic Provider B",
          regionCodes: ["ZZ"],
          status: "ACTIVE",
        },
      }),
      prisma.capability.create({
        data: { slug: `${prefix}_capability`, name: `${prefix} capability` },
      }),
      prisma.modality.create({
        data: { slug: `${prefix}_modality`, name: `${prefix} modality` },
      }),
    ]);
  Object.assign(ids, {
    lab: lab.id,
    providerA: providerA.id,
    providerB: providerB.id,
  });
  const [modelA, modelB] = await prisma.$transaction([
    prisma.aIModel.create({
      data: {
        labId: ids.lab,
        slug: `${prefix}_model_a`,
        name: "Synthetic Model A",
        status: "ACTIVE",
      },
    }),
    prisma.aIModel.create({
      data: {
        labId: ids.lab,
        slug: `${prefix}_model_b`,
        name: "Synthetic Model B",
        status: "ACTIVE",
      },
    }),
  ]);
  Object.assign(ids, { modelA: modelA.id, modelB: modelB.id });
  const [versionA, versionB] = await prisma.$transaction([
    prisma.modelVersion.create({
      data: {
        modelId: ids.modelA,
        versionLabel: "1.0",
        releaseDate: now,
        contextWindow: 8192,
      },
    }),
    prisma.modelVersion.create({
      data: {
        modelId: ids.modelB,
        versionLabel: "1.0",
        releaseDate: now,
        contextWindow: 4096,
      },
    }),
  ]);
  Object.assign(ids, { versionA: versionA.id, versionB: versionB.id });
  const [offeringA, offeringB] = await prisma.$transaction([
    prisma.modelProvider.create({
      data: {
        modelVersionId: ids.versionA,
        providerId: ids.providerA,
        providerModelId: `${prefix}-a`,
        endpointModalities: ["text"],
        regionCodes: ["ZZ"],
      },
    }),
    prisma.modelProvider.create({
      data: {
        modelVersionId: ids.versionB,
        providerId: ids.providerB,
        providerModelId: `${prefix}-b`,
        endpointModalities: ["text"],
        regionCodes: ["ZZ"],
      },
    }),
  ]);
  Object.assign(ids, { offeringA: offeringA.id, offeringB: offeringB.id });
  const pricing = await prisma.pricing.create({
    data: {
      modelProviderId: ids.offeringA,
      dataSourceId: ids.source,
      priceDimension: "input",
      billingUnit: "token",
      currency: "USD",
      amount: "0.12",
      effectiveFrom: now,
      status: "VERIFIED",
    },
  });
  ids.pricing = pricing.id;
  const availability = await prisma.modelProviderAvailability.create({
    data: {
      modelProviderId: ids.offeringA,
      dataSourceId: ids.source,
      status: "AVAILABLE",
      observedAt: now,
      effectiveFrom: now,
    },
  });
  ids.availability = availability.id;
  await prisma.$transaction([
    prisma.modelCapability.create({
      data: {
        modelVersionId: ids.versionA,
        capabilityId: capability.id,
        evidenceSourceId: ids.source,
        value: "yes",
        status: "VERIFIED",
      },
    }),
    prisma.modelModality.create({
      data: { modelVersionId: ids.versionA, modalityId: modality.id },
    }),
  ]);
  const [benchmarkHigher, benchmarkTarget] = await prisma.$transaction([
    prisma.benchmark.create({
      data: {
        slug: `${prefix}_higher`,
        version: "1",
        name: "Synthetic Higher Benchmark",
        methodology: { fixture: true },
        metric: "score",
        unit: "points",
        direction: "HIGHER_IS_BETTER",
        sourceId: ids.source,
      },
    }),
    prisma.benchmark.create({
      data: {
        slug: `${prefix}_target`,
        version: "1",
        name: "Synthetic Target Benchmark",
        methodology: { fixture: true },
        metric: "score",
        unit: "points",
        direction: "TARGET_RANGE",
        sourceId: ids.source,
      },
    }),
  ]);
  Object.assign(ids, {
    benchmarkHigher: benchmarkHigher.id,
    benchmarkTarget: benchmarkTarget.id,
  });
  const [verified, unverified, target] = await prisma.$transaction([
    prisma.benchmarkResult.create({
      data: {
        modelVersionId: ids.versionA,
        benchmarkId: ids.benchmarkHigher,
        dataSourceId: ids.source,
        scoreValue: "90",
        evaluatedAt: now,
        evaluationConditions: { fixture: true },
        status: "VERIFIED",
      },
    }),
    prisma.benchmarkResult.create({
      data: {
        modelVersionId: ids.versionB,
        benchmarkId: ids.benchmarkHigher,
        dataSourceId: ids.source,
        scoreValue: "95",
        evaluatedAt: now,
        evaluationConditions: { fixture: true },
        status: "ILLUSTRATIVE",
      },
    }),
    prisma.benchmarkResult.create({
      data: {
        modelVersionId: ids.versionA,
        benchmarkId: ids.benchmarkTarget,
        dataSourceId: ids.source,
        scoreValue: "50",
        evaluatedAt: now,
        evaluationConditions: { fixture: true },
        status: "VERIFIED",
      },
    }),
  ]);
  Object.assign(ids, {
    benchmarkResultVerified: verified.id,
    benchmarkResultUnverified: unverified.id,
    benchmarkResultTarget: target.id,
  });
}

async function cleanupFixtures() {
  await prisma.$transaction([
    prisma.benchmarkResult.deleteMany({
      where: {
        id: {
          in: [
            ids.benchmarkResultVerified,
            ids.benchmarkResultUnverified,
            ids.benchmarkResultTarget,
          ],
        },
      },
    }),
    prisma.modelProviderAvailability.deleteMany({
      where: { id: ids.availability },
    }),
    prisma.pricing.deleteMany({ where: { id: ids.pricing } }),
    prisma.modelCapability.deleteMany({
      where: { modelVersionId: ids.versionA },
    }),
    prisma.modelModality.deleteMany({
      where: { modelVersionId: ids.versionA },
    }),
    prisma.modelProvider.deleteMany({
      where: { id: { in: [ids.offeringA, ids.offeringB] } },
    }),
    prisma.benchmark.deleteMany({
      where: { id: { in: [ids.benchmarkHigher, ids.benchmarkTarget] } },
    }),
    prisma.modelVersion.deleteMany({
      where: { id: { in: [ids.versionA, ids.versionB] } },
    }),
    prisma.aIModel.deleteMany({
      where: { id: { in: [ids.modelA, ids.modelB] } },
    }),
    prisma.aILab.deleteMany({ where: { id: ids.lab } }),
    prisma.provider.deleteMany({
      where: { id: { in: [ids.providerA, ids.providerB] } },
    }),
    prisma.capability.deleteMany({ where: { slug: `${prefix}_capability` } }),
    prisma.modality.deleteMany({ where: { slug: `${prefix}_modality` } }),
    prisma.dataSource.deleteMany({ where: { id: ids.source } }),
  ]);
}

describe("live PostgreSQL Prisma/DAL/service integration", () => {
  beforeAll(async () => {
    await assertPrefixIsUnused();
    try {
      await createFixtures();
    } catch (error) {
      await cleanupFixtures();
      throw error;
    }
  });

  it("discovers models through filters, pagination, lab/provider relations, and routes", async () => {
    const result = await catalogService.listModels({
      page: 1,
      pageSize: 1,
      q: "Synthetic Model A",
      providerId: ids.providerA,
      capability: `${prefix}_capability`,
      modality: `${prefix}_modality`,
      status: "ACTIVE",
      sort: "name",
      direction: "asc",
    });
    expect(result.data.map((model) => model.id)).toEqual([ids.modelA]);
    expect(result.meta.pagination.total).toBe(1);
    const response = await getModels(
      new Request(`http://localhost/api/models?q=${prefix}_model_a`),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data[0].id).toBe(ids.modelA);
  });

  it("retrieves details, labs, providers, pricing, availability, provenance, and missing IDs", async () => {
    const model = await catalogService.getModel(ids.modelA);
    expect(model?.lab.id).toBe(ids.lab);
    expect(model?.versions[0].offerings[0].provider.id).toBe(ids.providerA);
    expect(model?.versions[0].offerings[0].pricing[0].amount.toString()).toBe(
      "0.12",
    );
    expect(
      model?.versions[0].offerings[0].availabilityObservations[0].status,
    ).toBe("AVAILABLE");
    expect(
      model?.versions[0].benchmarkResults[0].benchmark.source.publisher,
    ).toContain("synthetic");
    expect(
      (await catalogService.getLab(ids.lab)).models.map((item) => item.id),
    ).toContain(ids.modelA);
    expect(
      (await catalogService.getProvider(ids.providerA)).offerings[0]
        .modelVersion.model.id,
    ).toBe(ids.modelA);
    await expect(catalogService.getModel(randomUUID())).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    const missingResponse = await getModel(
      new Request(
        "http://localhost/api/models/00000000-0000-0000-0000-000000000000",
      ),
      {
        params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }),
      },
    );
    expect(missingResponse.status).toBe(404);
  });

  it("ranks verified results with direction and pagination, excludes unverified results, and rejects target range", async () => {
    const higher = await catalogService.rankings({
      benchmark: `${prefix}_higher`,
      page: 1,
      pageSize: 1,
    });
    expect(higher.data.ranking).toHaveLength(1);
    expect(higher.data.ranking[0].modelVersion.model.id).toBe(ids.modelA);
    expect(higher.data.exclusions).toEqual([
      { reason: "NON_VERIFIED_EVIDENCE", count: 1 },
    ]);
    const target = await catalogService.rankings({
      benchmark: `${prefix}_target`,
      page: 1,
      pageSize: 20,
    });
    expect(target.data.ranking).toEqual([]);
    expect(target.data.exclusions).toEqual([
      { reason: "TARGET_RANGE_NOT_ORDERABLE", count: 1 },
      { reason: "NON_VERIFIED_EVIDENCE", count: 0 },
    ]);
    const response = await getRankings(
      new Request(
        `http://localhost/api/rankings?benchmark=${prefix}_higher&page=1&pageSize=1`,
      ),
    );
    expect(response.status).toBe(200);
  });

  it("compares multiple models, preserves missing provider offerings, and reports unknown IDs", async () => {
    const compared = await catalogService.compare(
      [ids.modelA, ids.modelB],
      ids.providerA,
    );
    const comparedWithProviderContext = compared.data as Array<{
      id: string;
      providerContext?: { status: string };
    }>;
    expect(comparedWithProviderContext.map((model) => model.id)).toEqual([
      ids.modelA,
      ids.modelB,
    ]);
    expect(comparedWithProviderContext[0].providerContext?.status).toBe(
      "AVAILABLE",
    );
    expect(comparedWithProviderContext[1].providerContext?.status).toBe(
      "UNAVAILABLE",
    );
    await expect(
      catalogService.compare([ids.modelA, randomUUID()]),
    ).rejects.toMatchObject({ code: "UNKNOWN_MODEL_IDS", status: 404 });
    await expect(
      catalogService.compare([ids.modelA, ids.modelB], randomUUID()),
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    const response = await getCompare(
      new Request(
        `http://localhost/api/compare?modelId=${ids.modelA}&modelId=${ids.modelB}&provider=${ids.providerA}`,
      ),
    );
    expect(response.status).toBe(200);
  });

  it("exercises the direct DAL query path and confirms the fixture is synthetic", async () => {
    const result = await catalogDal.listBenchmarks({
      page: 1,
      pageSize: 10,
      benchmark: `${prefix}_higher`,
      direction: "asc",
    });
    expect(result.items[0].source.publisher).toContain("synthetic");
    expect(result.items[0].results.map((item) => item.status)).toContain(
      "VERIFIED",
    );
  });
});

afterAll(async () => {
  await cleanupFixtures();
  await prisma.$disconnect();
});
