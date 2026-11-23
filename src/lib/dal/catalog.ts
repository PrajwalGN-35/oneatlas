import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type PageInput = { page: number; pageSize: number };

export const catalogDal = {
  async listModels(
    input: {
      q?: string;
      labId?: string;
      providerId?: string;
      capability?: string;
      modality?: string;
      status?: string;
    } & PageInput & { sort?: string; direction?: "asc" | "desc" },
  ) {
    const skip = (input.page - 1) * input.pageSize;
    const where: Prisma.AIModelWhereInput = {
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { slug: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.labId ? { labId: input.labId } : {}),
      ...(input.status
        ? { status: input.status as Prisma.EnumLifecycleStatusFilter["equals"] }
        : {}),
      ...(input.providerId
        ? {
            versions: {
              some: { offerings: { some: { providerId: input.providerId } } },
            },
          }
        : {}),
      ...(input.capability
        ? {
            versions: {
              some: {
                capabilities: {
                  some: {
                    status: "VERIFIED",
                    evidenceSourceId: { not: null },
                    capability: { slug: input.capability },
                  },
                },
              },
            },
          }
        : {}),
      ...(input.modality
        ? {
            versions: {
              some: {
                modalities: { some: { modality: { slug: input.modality } } },
              },
            },
          }
        : {}),
    };
    const orderBy: Prisma.AIModelOrderByWithRelationInput[] =
      input.sort === "name"
        ? [{ name: input.direction }, { id: "asc" }]
        : input.sort === "updatedAt"
          ? [{ updatedAt: input.direction }, { id: "asc" }]
          : [{ createdAt: input.direction }, { id: "asc" }];

    const [items, total] = await prisma.$transaction([
      prisma.aIModel.findMany({
        where,
        orderBy,
        skip,
        take: input.pageSize,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lab: { select: { id: true, slug: true, name: true } },
        },
      }),
      prisma.aIModel.count({ where }),
    ]);
    return { items, total };
  },

  async getModel(id: string) {
    return prisma.aIModel.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lab: {
          select: {
            id: true,
            slug: true,
            name: true,
            website: true,
            status: true,
          },
        },
        versions: {
          orderBy: [{ releaseDate: "desc" }, { versionLabel: "asc" }],
          take: 100,
          select: {
            id: true,
            versionLabel: true,
            releaseDate: true,
            effectiveFrom: true,
            effectiveTo: true,
            contextWindow: true,
            maxOutputTokens: true,
            technicalAttributes: true,
            isDeprecated: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            offerings: {
              take: 100,
              select: {
                id: true,
                providerModelId: true,
                endpointModalities: true,
                regionCodes: true,
                effectiveFrom: true,
                effectiveTo: true,
                provider: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                    website: true,
                    status: true,
                  },
                },
                pricing: {
                  take: 100,
                  orderBy: [{ effectiveFrom: "desc" }, { observedAt: "desc" }],
                  select: {
                    id: true,
                    priceDimension: true,
                    billingUnit: true,
                    currency: true,
                    amount: true,
                    unitQuantity: true,
                    effectiveFrom: true,
                    effectiveTo: true,
                    observedAt: true,
                    status: true,
                    notes: true,
                    dataSource: {
                      select: {
                        id: true,
                        canonicalUrl: true,
                        publisher: true,
                        retrievedAt: true,
                        verifiedAt: true,
                        effectiveDate: true,
                        status: true,
                      },
                    },
                  },
                },
                availabilityObservations: {
                  take: 100,
                  orderBy: { observedAt: "desc" },
                  select: {
                    id: true,
                    status: true,
                    observedAt: true,
                    effectiveFrom: true,
                    effectiveTo: true,
                    notes: true,
                    dataSource: {
                      select: {
                        id: true,
                        canonicalUrl: true,
                        publisher: true,
                        retrievedAt: true,
                        verifiedAt: true,
                        effectiveDate: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
            capabilities: {
              take: 100,
              select: {
                id: true,
                value: true,
                status: true,
                notes: true,
                capability: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                  },
                },
                evidence: {
                  select: {
                    id: true,
                    canonicalUrl: true,
                    publisher: true,
                    retrievedAt: true,
                    verifiedAt: true,
                    effectiveDate: true,
                    status: true,
                  },
                },
              },
            },
            modalities: {
              take: 100,
              select: {
                modality: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            benchmarkResults: {
              take: 100,
              orderBy: { evaluatedAt: "desc" },
              select: {
                id: true,
                scoreValue: true,
                rawScore: true,
                evaluatedAt: true,
                evaluationConditions: true,
                status: true,
                notes: true,
                benchmark: {
                  select: {
                    id: true,
                    slug: true,
                    version: true,
                    name: true,
                    methodology: true,
                    metric: true,
                    unit: true,
                    direction: true,
                    population: true,
                    publishedAt: true,
                    description: true,
                    source: {
                      select: {
                        id: true,
                        canonicalUrl: true,
                        publisher: true,
                        retrievedAt: true,
                        verifiedAt: true,
                        effectiveDate: true,
                        status: true,
                      },
                    },
                  },
                },
                dataSource: {
                  select: {
                    id: true,
                    canonicalUrl: true,
                    publisher: true,
                    retrievedAt: true,
                    verifiedAt: true,
                    effectiveDate: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  async listLabs(
    input: PageInput & {
      q?: string;
      status?: string;
      sort?: string;
      direction: "asc" | "desc";
    },
  ) {
    const where: Prisma.AILabWhereInput = {
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { slug: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.status
        ? { status: input.status as Prisma.EnumLifecycleStatusFilter["equals"] }
        : {}),
    };
    const orderBy: Prisma.AILabOrderByWithRelationInput[] =
      input.sort === "name"
        ? [{ name: input.direction }, { id: "asc" }]
        : input.sort === "updatedAt"
          ? [{ updatedAt: input.direction }, { id: "asc" }]
          : [{ createdAt: input.direction }, { id: "asc" }];
    const [items, total] = await prisma.$transaction([
      prisma.aILab.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          website: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.aILab.count({ where }),
    ]);
    return { items, total };
  },

  async getLab(id: string) {
    return prisma.aILab.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        website: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        models: {
          take: 100,
          orderBy: { name: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  },

  async listProviders(
    input: PageInput & {
      q?: string;
      status?: string;
      sort?: string;
      direction: "asc" | "desc";
    },
  ) {
    const where: Prisma.ProviderWhereInput = {
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { slug: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.status
        ? { status: input.status as Prisma.EnumLifecycleStatusFilter["equals"] }
        : {}),
    };
    const orderBy: Prisma.ProviderOrderByWithRelationInput[] =
      input.sort === "name"
        ? [{ name: input.direction }, { id: "asc" }]
        : input.sort === "updatedAt"
          ? [{ updatedAt: input.direction }, { id: "asc" }]
          : [{ createdAt: input.direction }, { id: "asc" }];
    const [items, total] = await prisma.$transaction([
      prisma.provider.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          website: true,
          regionCodes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.provider.count({ where }),
    ]);
    return { items, total };
  },

  async getProvider(id: string) {
    return prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        website: true,
        regionCodes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        offerings: {
          take: 100,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            providerModelId: true,
            endpointModalities: true,
            regionCodes: true,
            effectiveFrom: true,
            effectiveTo: true,
            modelVersion: {
              select: {
                id: true,
                versionLabel: true,
                status: true,
                model: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                    status: true,
                    lab: { select: { id: true, slug: true, name: true } },
                  },
                },
              },
            },
            availabilityObservations: {
              take: 20,
              orderBy: { observedAt: "desc" },
              select: {
                id: true,
                status: true,
                observedAt: true,
                effectiveFrom: true,
                effectiveTo: true,
                notes: true,
                dataSource: {
                  select: {
                    id: true,
                    canonicalUrl: true,
                    publisher: true,
                    retrievedAt: true,
                    verifiedAt: true,
                    status: true,
                  },
                },
              },
            },
            pricing: {
              take: 20,
              orderBy: { effectiveFrom: "desc" },
              select: {
                id: true,
                priceDimension: true,
                billingUnit: true,
                currency: true,
                amount: true,
                unitQuantity: true,
                effectiveFrom: true,
                effectiveTo: true,
                observedAt: true,
                status: true,
                dataSource: {
                  select: {
                    id: true,
                    canonicalUrl: true,
                    publisher: true,
                    retrievedAt: true,
                    verifiedAt: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  async listBenchmarks(
    input: PageInput & {
      q?: string;
      benchmark?: string;
      model?: string;
      status?: string;
      sort?: string;
      direction: "asc" | "desc";
    },
  ) {
    const where: Prisma.BenchmarkWhereInput = {
      ...(input.benchmark
        ? {
            OR: [
              { slug: input.benchmark },
              { name: { contains: input.benchmark, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { slug: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.status
        ? {
            results: {
              some: {
                status:
                  input.status as Prisma.EnumEvidenceStatusFilter["equals"],
              },
            },
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.benchmark.findMany({
        where,
        orderBy:
          input.sort === "name"
            ? [{ name: input.direction }, { id: "asc" }]
            : [{ publishedAt: input.direction }, { id: "asc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: {
          id: true,
          slug: true,
          version: true,
          name: true,
          methodology: true,
          metric: true,
          unit: true,
          direction: true,
          population: true,
          publishedAt: true,
          description: true,
          source: {
            select: {
              id: true,
              canonicalUrl: true,
              publisher: true,
              retrievedAt: true,
              verifiedAt: true,
              effectiveDate: true,
              status: true,
            },
          },
          results: {
            where: input.status
              ? {
                  status:
                    input.status as Prisma.EnumEvidenceStatusFilter["equals"],
                }
              : {},
            take: 100,
            orderBy: { evaluatedAt: "desc" },
            select: {
              id: true,
              scoreValue: true,
              rawScore: true,
              evaluatedAt: true,
              evaluationConditions: true,
              status: true,
              notes: true,
              modelVersion: {
                select: {
                  id: true,
                  versionLabel: true,
                  model: { select: { id: true, slug: true, name: true } },
                },
              },
              dataSource: {
                select: {
                  id: true,
                  canonicalUrl: true,
                  publisher: true,
                  retrievedAt: true,
                  verifiedAt: true,
                  effectiveDate: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.benchmark.count({ where }),
    ]);
    return { items, total };
  },

  async getProviderExistence(id: string) {
    return prisma.provider.findUnique({ where: { id }, select: { id: true } });
  },

  async compareModels(ids: string[]) {
    return prisma.aIModel.findMany({
      where: { id: { in: ids } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        lab: { select: { id: true, slug: true, name: true } },
        versions: {
          take: 100,
          orderBy: { releaseDate: "desc" },
          select: {
            id: true,
            versionLabel: true,
            releaseDate: true,
            contextWindow: true,
            maxOutputTokens: true,
            status: true,
            modalities: {
              take: 100,
              select: {
                modality: { select: { id: true, slug: true, name: true } },
              },
            },
            capabilities: {
              take: 100,
              select: {
                value: true,
                status: true,
                notes: true,
                capability: { select: { id: true, slug: true, name: true } },
                evidence: {
                  select: {
                    id: true,
                    canonicalUrl: true,
                    publisher: true,
                    retrievedAt: true,
                    verifiedAt: true,
                    status: true,
                  },
                },
              },
            },
            offerings: {
              take: 100,
              select: {
                id: true,
                providerModelId: true,
                regionCodes: true,
                provider: { select: { id: true, slug: true, name: true } },
                pricing: {
                  take: 100,
                  select: {
                    id: true,
                    priceDimension: true,
                    billingUnit: true,
                    currency: true,
                    amount: true,
                    unitQuantity: true,
                    effectiveFrom: true,
                    effectiveTo: true,
                    status: true,
                    dataSource: {
                      select: {
                        id: true,
                        canonicalUrl: true,
                        publisher: true,
                        retrievedAt: true,
                        verifiedAt: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
            benchmarkResults: {
              take: 100,
              orderBy: { evaluatedAt: "desc" },
              select: {
                id: true,
                scoreValue: true,
                rawScore: true,
                evaluatedAt: true,
                status: true,
                benchmark: {
                  select: {
                    id: true,
                    slug: true,
                    version: true,
                    name: true,
                    metric: true,
                    unit: true,
                    direction: true,
                    methodology: true,
                    population: true,
                    source: {
                      select: {
                        id: true,
                        canonicalUrl: true,
                        publisher: true,
                        retrievedAt: true,
                        verifiedAt: true,
                        status: true,
                      },
                    },
                  },
                },
                dataSource: {
                  select: {
                    id: true,
                    canonicalUrl: true,
                    publisher: true,
                    retrievedAt: true,
                    verifiedAt: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  async rankings(
    input: {
      benchmark: string;
      provider?: string;
      sort?: string;
      direction?: "asc" | "desc";
    } & PageInput,
  ) {
    const benchmarkWhere: Prisma.BenchmarkWhereInput =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        input.benchmark,
      )
        ? { OR: [{ id: input.benchmark }, { slug: input.benchmark }] }
        : { slug: input.benchmark };
    const benchmark = await prisma.benchmark.findFirst({
      where: benchmarkWhere,
      select: {
        id: true,
        slug: true,
        version: true,
        name: true,
        methodology: true,
        metric: true,
        unit: true,
        direction: true,
        population: true,
        publishedAt: true,
        source: {
          select: {
            id: true,
            canonicalUrl: true,
            publisher: true,
            retrievedAt: true,
            verifiedAt: true,
            effectiveDate: true,
            status: true,
          },
        },
      },
    });
    if (!benchmark)
      return {
        benchmark: null,
        rankings: [],
        excluded: [{ reason: "UNKNOWN_BENCHMARK", count: 0 }],
        total: 0,
      };

    const eligibleWhere: Prisma.BenchmarkResultWhereInput = {
      benchmarkId: benchmark.id,
      status: "VERIFIED",
      ...(input.provider
        ? {
            modelVersion: {
              offerings: { some: { providerId: input.provider } },
            },
          }
        : {}),
    };
    const excludedWhere: Prisma.BenchmarkResultWhereInput = {
      benchmarkId: benchmark.id,
      status: { not: "VERIFIED" },
      ...(input.provider
        ? {
            modelVersion: {
              offerings: { some: { providerId: input.provider } },
            },
          }
        : {}),
    };

    if (benchmark.direction === "TARGET_RANGE") {
      const [eligibleCount, excludedCount] = await prisma.$transaction([
        prisma.benchmarkResult.count({ where: eligibleWhere }),
        prisma.benchmarkResult.count({ where: excludedWhere }),
      ]);
      return {
        benchmark,
        rankings: [],
        excluded: [
          { reason: "TARGET_RANGE_NOT_ORDERABLE", count: eligibleCount },
          { reason: "NON_VERIFIED_EVIDENCE", count: excludedCount },
        ],
        total: 0,
      };
    }

    const skip = (input.page - 1) * input.pageSize;
    const scoreDirection =
      benchmark.direction === "LOWER_IS_BETTER" ? "asc" : "desc";
    const orderBy: Prisma.BenchmarkResultOrderByWithRelationInput[] =
      input.sort === "evaluatedAt"
        ? [{ evaluatedAt: input.direction ?? "desc" }, { id: "asc" }]
        : [
            { scoreValue: scoreDirection },
            { modelVersionId: "asc" },
            { id: "asc" },
          ];

    const [rankings, total, excludedCount] = await prisma.$transaction([
      prisma.benchmarkResult.findMany({
        where: eligibleWhere,
        skip,
        take: input.pageSize,
        orderBy,
        select: {
          id: true,
          scoreValue: true,
          rawScore: true,
          evaluatedAt: true,
          evaluationConditions: true,
          status: true,
          notes: true,
          benchmarkId: true,
          modelVersion: {
            select: {
              id: true,
              versionLabel: true,
              model: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  status: true,
                  lab: { select: { id: true, slug: true, name: true } },
                },
              },
            },
          },
          dataSource: {
            select: {
              id: true,
              canonicalUrl: true,
              publisher: true,
              retrievedAt: true,
              verifiedAt: true,
              effectiveDate: true,
              status: true,
            },
          },
        },
      }),
      prisma.benchmarkResult.count({ where: eligibleWhere }),
      prisma.benchmarkResult.count({ where: excludedWhere }),
    ]);

    return {
      benchmark,
      rankings,
      excluded: [{ reason: "NON_VERIFIED_EVIDENCE", count: excludedCount }],
      total,
    };
  },
};
