CREATE TABLE "PromotionBatch" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "exportedAt" TIMESTAMP(3),
  CONSTRAINT "PromotionBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromotionItem" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "productCode" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "itemType" TEXT NOT NULL,
  "qty" INTEGER NOT NULL,
  "agingDays" INTEGER NOT NULL,
  "cost" DOUBLE PRECISION NOT NULL,
  "sellPrice" DOUBLE PRECISION,
  "margin" DOUBLE PRECISION,
  "score" INTEGER NOT NULL,
  "reasonsJson" TEXT NOT NULL,
  "recommendation" TEXT NOT NULL,
  "reviewStatus" TEXT NOT NULL,
  "generatedCopyJson" TEXT NOT NULL,
  "sourceSnapshotJson" TEXT NOT NULL,
  CONSTRAINT "PromotionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromotionExport" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromotionExport_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PromotionItem"
ADD CONSTRAINT "PromotionItem_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "PromotionBatch"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromotionExport"
ADD CONSTRAINT "PromotionExport_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "PromotionBatch"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
