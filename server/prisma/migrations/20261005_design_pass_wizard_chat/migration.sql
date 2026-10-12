-- AlterEnum: Add PARTIALLY_COMPLETE to JobStatus if not exists
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_COMPLETE';

-- CreateEnum: WizardStatus
CREATE TYPE "WizardStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CONFIRMED', 'GENERATING', 'GENERATED', 'ARCHIVED');

-- CreateEnum: FreePreviewStatus
CREATE TYPE "FreePreviewStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'CONSUMED', 'RELEASED');

-- CreateEnum: AssetAccessLevel
CREATE TYPE "AssetAccessLevel" AS ENUM ('FREE_PREVIEW', 'DESIGN_PASS', 'ADMIN_ONLY');

-- CreateEnum: ChatMessageStatus
CREATE TYPE "ChatMessageStatus" AS ENUM ('PENDING', 'STREAMING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable: Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceInPaise" INTEGER NOT NULL DEFAULT 29900;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "creditType" TEXT NOT NULL DEFAULT 'THREE_D_GENERATION';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "autoRenewal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Purchase
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "amountInPaise" INTEGER NOT NULL DEFAULT 29900;
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "productName" TEXT;
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "durationDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "creditsGranted" INTEGER NOT NULL DEFAULT 5;
CREATE INDEX IF NOT EXISTS "Purchase_status_idx" ON "Purchase"("status");

-- AlterTable: Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "amountInPaise" INTEGER NOT NULL DEFAULT 29900;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");

-- AlterTable: CreditTransaction
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "balanceAfter" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

-- CreateTable: WizardSession
CREATE TABLE IF NOT EXISTS "WizardSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "currentStage" INTEGER NOT NULL DEFAULT 1,
    "status" "WizardStatus" NOT NULL DEFAULT 'DRAFT',
    "wizardData" JSONB NOT NULL,
    "confirmedSnapshot" JSONB,
    "inputHash" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WizardSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FreePreviewEntitlement
CREATE TABLE IF NOT EXISTS "FreePreviewEntitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "FreePreviewStatus" NOT NULL DEFAULT 'AVAILABLE',
    "generationJobId" TEXT,
    "reservedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreePreviewEntitlement_pkey" PRIMARY KEY ("id")
);

-- AlterTable: GenerationJob
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "wizardSessionId" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "accessPassId" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "creditReservationId" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "freePreviewEntitlementId" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "generationType" TEXT NOT NULL DEFAULT 'FREE_2D_PREVIEW';
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "attemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "lockedBy" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "leaseExpiresAt" TIMESTAMP(3);
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "heartbeatAt" TIMESTAMP(3);
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "nextRetryAt" TIMESTAMP(3);
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "failureCode" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "progressStage" TEXT;
ALTER TABLE "GenerationJob" ADD COLUMN IF NOT EXISTS "inputHash" TEXT;
CREATE INDEX IF NOT EXISTS "GenerationJob_leaseExpiresAt_idx" ON "GenerationJob"("leaseExpiresAt");

-- CreateTable: GenerationAsset
CREATE TABLE IF NOT EXISTS "GenerationAsset" (
    "id" TEXT NOT NULL,
    "generationJobId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "accessLevel" "AssetAccessLevel" NOT NULL DEFAULT 'DESIGN_PASS',
    "status" TEXT NOT NULL DEFAULT 'READY',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ConstructionRate
CREATE TABLE IF NOT EXISTS "ConstructionRate" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Indore',
    "packageType" TEXT NOT NULL,
    "ratePerSqFt" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "sourceNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WebhookEvent
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "failureReason" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChatSession
CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionHash" TEXT,
    "projectId" TEXT,
    "wizardSessionId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'New Planning Session',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChatMessage
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "clientMessageId" TEXT,
    "status" "ChatMessageStatus" NOT NULL DEFAULT 'COMPLETED',
    "toolName" TEXT,
    "toolResult" JSONB,
    "providerResponseId" TEXT,
    "failureCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChatUsage
CREATE TABLE IF NOT EXISTS "ChatUsage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messageId" TEXT,
    "userId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChatFeedback
CREATE TABLE IF NOT EXISTS "ChatFeedback" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChatQuotaUsage
CREATE TABLE IF NOT EXISTS "ChatQuotaUsage" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "usageDate" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatQuotaUsage_pkey" PRIMARY KEY ("id")
);

-- Unique & Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "FreePreviewEntitlement_userId_key" ON "FreePreviewEntitlement"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "FreePreviewEntitlement_generationJobId_key" ON "FreePreviewEntitlement"("generationJobId");
CREATE INDEX IF NOT EXISTS "FreePreviewEntitlement_userId_idx" ON "FreePreviewEntitlement"("userId");
CREATE INDEX IF NOT EXISTS "FreePreviewEntitlement_status_idx" ON "FreePreviewEntitlement"("status");

CREATE INDEX IF NOT EXISTS "WizardSession_userId_idx" ON "WizardSession"("userId");
CREATE INDEX IF NOT EXISTS "WizardSession_status_idx" ON "WizardSession"("status");
CREATE INDEX IF NOT EXISTS "WizardSession_inputHash_idx" ON "WizardSession"("inputHash");

CREATE INDEX IF NOT EXISTS "GenerationAsset_generationJobId_idx" ON "GenerationAsset"("generationJobId");
CREATE INDEX IF NOT EXISTS "GenerationAsset_assetType_idx" ON "GenerationAsset"("assetType");
CREATE INDEX IF NOT EXISTS "GenerationAsset_accessLevel_idx" ON "GenerationAsset"("accessLevel");

CREATE INDEX IF NOT EXISTS "ConstructionRate_city_packageType_isActive_idx" ON "ConstructionRate"("city", "packageType", "isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "WebhookEvent_providerEventId_key" ON "WebhookEvent"("providerEventId");
CREATE INDEX IF NOT EXISTS "WebhookEvent_providerEventId_idx" ON "WebhookEvent"("providerEventId");
CREATE INDEX IF NOT EXISTS "WebhookEvent_processingStatus_idx" ON "WebhookEvent"("processingStatus");

CREATE INDEX IF NOT EXISTS "ChatSession_userId_idx" ON "ChatSession"("userId");
CREATE INDEX IF NOT EXISTS "ChatSession_guestSessionHash_idx" ON "ChatSession"("guestSessionHash");
CREATE INDEX IF NOT EXISTS "ChatSession_wizardSessionId_idx" ON "ChatSession"("wizardSessionId");

CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
CREATE INDEX IF NOT EXISTS "ChatMessage_clientMessageId_idx" ON "ChatMessage"("clientMessageId");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

CREATE INDEX IF NOT EXISTS "ChatUsage_sessionId_idx" ON "ChatUsage"("sessionId");
CREATE INDEX IF NOT EXISTS "ChatUsage_userId_idx" ON "ChatUsage"("userId");

CREATE INDEX IF NOT EXISTS "ChatFeedback_messageId_idx" ON "ChatFeedback"("messageId");
CREATE INDEX IF NOT EXISTS "ChatFeedback_userId_idx" ON "ChatFeedback"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "ChatQuotaUsage_subjectId_usageDate_key" ON "ChatQuotaUsage"("subjectId", "usageDate");
CREATE INDEX IF NOT EXISTS "ChatQuotaUsage_usageDate_idx" ON "ChatQuotaUsage"("usageDate");

-- Foreign Key Constraints (additive with ON DELETE rules)
ALTER TABLE "WizardSession" ADD CONSTRAINT "WizardSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FreePreviewEntitlement" ADD CONSTRAINT "FreePreviewEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreePreviewEntitlement" ADD CONSTRAINT "FreePreviewEntitlement_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_wizardSessionId_fkey" FOREIGN KEY ("wizardSessionId") REFERENCES "WizardSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GenerationAsset" ADD CONSTRAINT "GenerationAsset_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_wizardSessionId_fkey" FOREIGN KEY ("wizardSessionId") REFERENCES "WizardSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatUsage" ADD CONSTRAINT "ChatUsage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatUsage" ADD CONSTRAINT "ChatUsage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatFeedback" ADD CONSTRAINT "ChatFeedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
