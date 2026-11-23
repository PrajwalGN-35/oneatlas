-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'ILLUSTRATIVE', 'ESTIMATED', 'UNAVAILABLE', 'CONFLICTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'LIMITED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BenchmarkDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE');

-- CreateEnum
CREATE TYPE "CandidateEligibility" AS ENUM ('ELIGIBLE', 'INELIGIBLE', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "AILab" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AILab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" UUID NOT NULL,
    "labId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "releaseDate" DATE,
    "effectiveFrom" TIMESTAMPTZ(6),
    "effectiveTo" TIMESTAMPTZ(6),
    "contextWindow" INTEGER,
    "maxOutputTokens" INTEGER,
    "technicalAttributes" JSONB,
    "isDeprecated" BOOLEAN NOT NULL DEFAULT false,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "regionCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelProvider" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "providerModelId" TEXT,
    "endpointModalities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regionCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effectiveFrom" TIMESTAMPTZ(6),
    "effectiveTo" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ModelProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelProviderAvailability" (
    "id" UUID NOT NULL,
    "modelProviderId" UUID NOT NULL,
    "dataSourceId" UUID NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "observedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveFrom" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelProviderAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pricing" (
    "id" UUID NOT NULL,
    "modelProviderId" UUID NOT NULL,
    "dataSourceId" UUID NOT NULL,
    "priceDimension" TEXT NOT NULL,
    "billingUnit" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "amount" DECIMAL(20,10) NOT NULL,
    "unitQuantity" DECIMAL(20,10) NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMPTZ(6) NOT NULL,
    "effectiveTo" TIMESTAMPTZ(6),
    "observedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelCapability" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID NOT NULL,
    "capabilityId" UUID NOT NULL,
    "evidenceSourceId" UUID,
    "value" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ModelCapability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modality" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Modality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelModality" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID NOT NULL,
    "modalityId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelModality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benchmark" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "methodology" JSONB NOT NULL,
    "metric" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "direction" "BenchmarkDirection" NOT NULL,
    "population" TEXT,
    "sourceId" UUID NOT NULL,
    "publishedAt" DATE,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkResult" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID NOT NULL,
    "benchmarkId" UUID NOT NULL,
    "dataSourceId" UUID NOT NULL,
    "scoreValue" DECIMAL(24,10) NOT NULL,
    "rawScore" TEXT,
    "evaluatedAt" TIMESTAMPTZ(6) NOT NULL,
    "evaluationConditions" JSONB NOT NULL,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenchmarkResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" UUID NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "retrievedAt" TIMESTAMPTZ(6) NOT NULL,
    "verifiedAt" TIMESTAMPTZ(6),
    "effectiveDate" DATE,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "checksum" TEXT,
    "citationIdentifier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkloadCategory" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkloadCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuitabilityPolicy" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "hardConstraints" JSONB NOT NULL,
    "configuration" JSONB,
    "effectiveFrom" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuitabilityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogSnapshot" (
    "id" UUID NOT NULL,
    "contentHash" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "capturedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuitabilityEvaluation" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "workloadCategoryId" UUID NOT NULL,
    "catalogSnapshotId" UUID NOT NULL,
    "requestHash" TEXT,
    "input" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuitabilityEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuitabilityResult" (
    "id" UUID NOT NULL,
    "evaluationId" UUID NOT NULL,
    "modelProviderId" UUID NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "eligibility" "CandidateEligibility" NOT NULL,
    "totalScore" DECIMAL(8,5),
    "scoreComponents" JSONB NOT NULL,
    "hardConstraintResults" JSONB NOT NULL,
    "unknowns" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuitabilityResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AILab_slug_key" ON "AILab"("slug");

-- CreateIndex
CREATE INDEX "AILab_status_idx" ON "AILab"("status");

-- CreateIndex
CREATE INDEX "AILab_name_idx" ON "AILab"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_slug_key" ON "AIModel"("slug");

-- CreateIndex
CREATE INDEX "AIModel_labId_idx" ON "AIModel"("labId");

-- CreateIndex
CREATE INDEX "AIModel_status_idx" ON "AIModel"("status");

-- CreateIndex
CREATE INDEX "AIModel_name_idx" ON "AIModel"("name");

-- CreateIndex
CREATE INDEX "AIModel_labId_status_idx" ON "AIModel"("labId", "status");

-- CreateIndex
CREATE INDEX "ModelVersion_modelId_idx" ON "ModelVersion"("modelId");

-- CreateIndex
CREATE INDEX "ModelVersion_versionLabel_idx" ON "ModelVersion"("versionLabel");

-- CreateIndex
CREATE INDEX "ModelVersion_status_idx" ON "ModelVersion"("status");

-- CreateIndex
CREATE INDEX "ModelVersion_contextWindow_idx" ON "ModelVersion"("contextWindow");

-- CreateIndex
CREATE INDEX "ModelVersion_releaseDate_idx" ON "ModelVersion"("releaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVersion_modelId_versionLabel_key" ON "ModelVersion"("modelId", "versionLabel");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE INDEX "Provider_name_idx" ON "Provider"("name");

-- CreateIndex
CREATE INDEX "Provider_status_idx" ON "Provider"("status");

-- CreateIndex
CREATE INDEX "ModelProvider_providerId_idx" ON "ModelProvider"("providerId");

-- CreateIndex
CREATE INDEX "ModelProvider_modelVersionId_idx" ON "ModelProvider"("modelVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelProvider_modelVersionId_providerId_key" ON "ModelProvider"("modelVersionId", "providerId");

-- CreateIndex
CREATE INDEX "ModelProviderAvailability_modelProviderId_observedAt_idx" ON "ModelProviderAvailability"("modelProviderId", "observedAt");

-- CreateIndex
CREATE INDEX "ModelProviderAvailability_dataSourceId_idx" ON "ModelProviderAvailability"("dataSourceId");

-- CreateIndex
CREATE INDEX "ModelProviderAvailability_status_idx" ON "ModelProviderAvailability"("status");

-- CreateIndex
CREATE INDEX "ModelProviderAvailability_effectiveFrom_effectiveTo_idx" ON "ModelProviderAvailability"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "Pricing_modelProviderId_idx" ON "Pricing"("modelProviderId");

-- CreateIndex
CREATE INDEX "Pricing_dataSourceId_idx" ON "Pricing"("dataSourceId");

-- CreateIndex
CREATE INDEX "Pricing_effectiveFrom_effectiveTo_idx" ON "Pricing"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "Pricing_currency_idx" ON "Pricing"("currency");

-- CreateIndex
CREATE INDEX "Pricing_status_idx" ON "Pricing"("status");

-- CreateIndex
CREATE INDEX "Pricing_priceDimension_billingUnit_idx" ON "Pricing"("priceDimension", "billingUnit");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_slug_key" ON "Capability"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_name_key" ON "Capability"("name");

-- CreateIndex
CREATE INDEX "ModelCapability_modelVersionId_capabilityId_idx" ON "ModelCapability"("modelVersionId", "capabilityId");

-- CreateIndex
CREATE INDEX "ModelCapability_capabilityId_idx" ON "ModelCapability"("capabilityId");

-- CreateIndex
CREATE INDEX "ModelCapability_evidenceSourceId_idx" ON "ModelCapability"("evidenceSourceId");

-- CreateIndex
CREATE INDEX "ModelCapability_status_idx" ON "ModelCapability"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Modality_slug_key" ON "Modality"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Modality_name_key" ON "Modality"("name");

-- CreateIndex
CREATE INDEX "ModelModality_modalityId_idx" ON "ModelModality"("modalityId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelModality_modelVersionId_modalityId_key" ON "ModelModality"("modelVersionId", "modalityId");

-- CreateIndex
CREATE INDEX "Benchmark_name_idx" ON "Benchmark"("name");

-- CreateIndex
CREATE INDEX "Benchmark_sourceId_idx" ON "Benchmark"("sourceId");

-- CreateIndex
CREATE INDEX "Benchmark_publishedAt_idx" ON "Benchmark"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Benchmark_slug_version_key" ON "Benchmark"("slug", "version");

-- CreateIndex
CREATE INDEX "BenchmarkResult_modelVersionId_idx" ON "BenchmarkResult"("modelVersionId");

-- CreateIndex
CREATE INDEX "BenchmarkResult_benchmarkId_evaluatedAt_idx" ON "BenchmarkResult"("benchmarkId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "BenchmarkResult_dataSourceId_idx" ON "BenchmarkResult"("dataSourceId");

-- CreateIndex
CREATE INDEX "BenchmarkResult_status_idx" ON "BenchmarkResult"("status");

-- CreateIndex
CREATE INDEX "DataSource_canonicalUrl_idx" ON "DataSource"("canonicalUrl");

-- CreateIndex
CREATE INDEX "DataSource_publisher_idx" ON "DataSource"("publisher");

-- CreateIndex
CREATE INDEX "DataSource_status_idx" ON "DataSource"("status");

-- CreateIndex
CREATE INDEX "DataSource_verifiedAt_idx" ON "DataSource"("verifiedAt");

-- CreateIndex
CREATE INDEX "DataSource_retrievedAt_idx" ON "DataSource"("retrievedAt");

-- CreateIndex
CREATE INDEX "WorkloadCategory_name_idx" ON "WorkloadCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkloadCategory_slug_version_key" ON "WorkloadCategory"("slug", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SuitabilityPolicy_version_key" ON "SuitabilityPolicy"("version");

-- CreateIndex
CREATE INDEX "SuitabilityPolicy_effectiveFrom_idx" ON "SuitabilityPolicy"("effectiveFrom");

-- CreateIndex
CREATE INDEX "CatalogSnapshot_contentHash_idx" ON "CatalogSnapshot"("contentHash");

-- CreateIndex
CREATE INDEX "CatalogSnapshot_capturedAt_idx" ON "CatalogSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "SuitabilityEvaluation_policyId_idx" ON "SuitabilityEvaluation"("policyId");

-- CreateIndex
CREATE INDEX "SuitabilityEvaluation_workloadCategoryId_idx" ON "SuitabilityEvaluation"("workloadCategoryId");

-- CreateIndex
CREATE INDEX "SuitabilityEvaluation_catalogSnapshotId_idx" ON "SuitabilityEvaluation"("catalogSnapshotId");

-- CreateIndex
CREATE INDEX "SuitabilityEvaluation_createdAt_idx" ON "SuitabilityEvaluation"("createdAt");

-- CreateIndex
CREATE INDEX "SuitabilityEvaluation_requestHash_idx" ON "SuitabilityEvaluation"("requestHash");

-- CreateIndex
CREATE INDEX "SuitabilityResult_evaluationId_idx" ON "SuitabilityResult"("evaluationId");

-- CreateIndex
CREATE INDEX "SuitabilityResult_modelProviderId_idx" ON "SuitabilityResult"("modelProviderId");

-- CreateIndex
CREATE INDEX "SuitabilityResult_eligibility_idx" ON "SuitabilityResult"("eligibility");

-- CreateIndex
CREATE INDEX "SuitabilityResult_totalScore_idx" ON "SuitabilityResult"("totalScore");

-- CreateIndex
CREATE UNIQUE INDEX "SuitabilityResult_evaluationId_modelProviderId_key" ON "SuitabilityResult"("evaluationId", "modelProviderId");

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_labId_fkey" FOREIGN KEY ("labId") REFERENCES "AILab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVersion" ADD CONSTRAINT "ModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProvider" ADD CONSTRAINT "ModelProvider_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProvider" ADD CONSTRAINT "ModelProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProviderAvailability" ADD CONSTRAINT "ModelProviderAvailability_modelProviderId_fkey" FOREIGN KEY ("modelProviderId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProviderAvailability" ADD CONSTRAINT "ModelProviderAvailability_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_modelProviderId_fkey" FOREIGN KEY ("modelProviderId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelCapability" ADD CONSTRAINT "ModelCapability_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelCapability" ADD CONSTRAINT "ModelCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelCapability" ADD CONSTRAINT "ModelCapability_evidenceSourceId_fkey" FOREIGN KEY ("evidenceSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelModality" ADD CONSTRAINT "ModelModality_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelModality" ADD CONSTRAINT "ModelModality_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benchmark" ADD CONSTRAINT "Benchmark_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkResult" ADD CONSTRAINT "BenchmarkResult_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkResult" ADD CONSTRAINT "BenchmarkResult_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "Benchmark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkResult" ADD CONSTRAINT "BenchmarkResult_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuitabilityEvaluation" ADD CONSTRAINT "SuitabilityEvaluation_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "SuitabilityPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuitabilityEvaluation" ADD CONSTRAINT "SuitabilityEvaluation_workloadCategoryId_fkey" FOREIGN KEY ("workloadCategoryId") REFERENCES "WorkloadCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuitabilityEvaluation" ADD CONSTRAINT "SuitabilityEvaluation_catalogSnapshotId_fkey" FOREIGN KEY ("catalogSnapshotId") REFERENCES "CatalogSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuitabilityResult" ADD CONSTRAINT "SuitabilityResult_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "SuitabilityEvaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuitabilityResult" ADD CONSTRAINT "SuitabilityResult_modelProviderId_fkey" FOREIGN KEY ("modelProviderId") REFERENCES "ModelProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
