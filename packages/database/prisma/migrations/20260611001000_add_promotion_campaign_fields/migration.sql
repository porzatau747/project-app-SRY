ALTER TABLE "PromotionBatch"
ADD COLUMN "campaignType" TEXT NOT NULL DEFAULT 'clearance';

ALTER TABLE "PromotionBatch"
ADD COLUMN "templatePreset" TEXT NOT NULL DEFAULT 'clearance';
