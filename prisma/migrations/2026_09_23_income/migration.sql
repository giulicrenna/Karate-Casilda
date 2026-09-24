-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "method" TEXT NOT NULL,
    "receiptDriveFileId" TEXT,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Income_occurredAt_idx" ON "Income"("occurredAt");

-- CreateIndex
CREATE INDEX "Income_category_idx" ON "Income"("category");

