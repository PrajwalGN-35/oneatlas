import "server-only";

import { catalogDal } from "@/lib/dal/catalog";
import { ApiException, normalizePrismaError, notFound } from "@/lib/api/errors";
import { pageMeta } from "@/lib/validation";

async function withDb<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw normalizePrismaError(error);
  }
}

export const catalogService = {
  async listModels(input: Parameters<typeof catalogDal.listModels>[0]) {
    const { items, total } = await withDb(() => catalogDal.listModels(input));
    return {
      data: items,
      meta: { ...pageMeta(input.page, input.pageSize, total), filters: input },
    };
  },
  async getModel(id: string) {
    const model = await withDb(() => catalogDal.getModel(id));
    if (!model) throw notFound("Model");
    return model;
  },
  async listLabs(input: Parameters<typeof catalogDal.listLabs>[0]) {
    const { items, total } = await withDb(() => catalogDal.listLabs(input));
    return {
      data: items,
      meta: { ...pageMeta(input.page, input.pageSize, total), filters: input },
    };
  },
  async getLab(id: string) {
    const lab = await withDb(() => catalogDal.getLab(id));
    if (!lab) throw notFound("AI lab");
    return lab;
  },
  async listProviders(input: Parameters<typeof catalogDal.listProviders>[0]) {
    const { items, total } = await withDb(() =>
      catalogDal.listProviders(input),
    );
    return {
      data: items,
      meta: { ...pageMeta(input.page, input.pageSize, total), filters: input },
    };
  },
  async getProvider(id: string) {
    const provider = await withDb(() => catalogDal.getProvider(id));
    if (!provider) throw notFound("Provider");
    return provider;
  },
  async listBenchmarks(input: Parameters<typeof catalogDal.listBenchmarks>[0]) {
    const { items, total } = await withDb(() =>
      catalogDal.listBenchmarks(input),
    );
    return {
      data: items,
      meta: { ...pageMeta(input.page, input.pageSize, total), filters: input },
    };
  },
  async compare(ids: string[], providerId?: string) {
    if (ids.length < 2)
      throw new ApiException(
        "COMPARISON_TOO_SMALL",
        "At least two distinct model IDs are required",
        400,
      );
    if (ids.length > 10)
      throw new ApiException(
        "COMPARISON_TOO_LARGE",
        "A maximum of 10 models can be compared",
        400,
      );
    if (new Set(ids).size !== ids.length)
      throw new ApiException(
        "COMPARISON_DUPLICATE",
        "Duplicate model IDs are not allowed",
        400,
      );
    if (providerId) {
      const provider = await withDb(() =>
        catalogDal.getProviderExistence(providerId),
      );
      if (!provider) throw notFound("Provider");
    }
    const models = await withDb(() => catalogDal.compareModels(ids));
    if (models.length !== ids.length) {
      const found = new Set(models.map((model) => model.id));
      throw new ApiException(
        "UNKNOWN_MODEL_IDS",
        "One or more model IDs do not exist",
        404,
        {
          unknownModelIds: ids.filter((id) => !found.has(id)),
        },
      );
    }
    const byId = new Map(models.map((model) => [model.id, model]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((model) => model !== undefined)
      .map((model) => {
        if (!providerId) return model;
        const matchingOfferings = model.versions.flatMap((version) =>
          version.offerings.filter(
            (offering) => offering.provider.id === providerId,
          ),
        );
        return {
          ...model,
          providerContext: {
            providerId,
            status: matchingOfferings.length ? "AVAILABLE" : "UNAVAILABLE",
            offerings: matchingOfferings,
          },
        };
      });
    return {
      data: ordered,
      meta: {
        providerId: providerId ?? null,
        comparisonSize: ordered.length,
        unavailableValuesPreserved: true,
      },
    };
  },
  async rankings(input: Parameters<typeof catalogDal.rankings>[0]) {
    if (input.provider) {
      const provider = await withDb(() =>
        catalogDal.getProviderExistence(input.provider!),
      );
      if (!provider) throw notFound("Provider");
    }
    const result = await withDb(() => catalogDal.rankings(input));
    if (!result.benchmark) throw notFound("Benchmark");
    return {
      data: {
        benchmark: result.benchmark,
        ranking: result.rankings,
        exclusions: result.excluded,
      },
      meta: {
        ...pageMeta(input.page, input.pageSize, result.total),
        verifiedOnly: true,
        compatibility: {
          benchmarkId: result.benchmark.id,
          benchmarkVersion: result.benchmark.version,
          metric: result.benchmark.metric,
          unit: result.benchmark.unit,
          direction: result.benchmark.direction,
          population: result.benchmark.population,
          methodologyPreserved: true,
        },
      },
    };
  },
};
