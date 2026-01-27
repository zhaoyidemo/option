-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "initialAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "inputAmount" DOUBLE PRECISION NOT NULL,
    "inputCurrency" TEXT NOT NULL,
    "strikePrice" DOUBLE PRECISION NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "apr" DOUBLE PRECISION NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "exerciseAmount" DOUBLE PRECISION NOT NULL,
    "exerciseCurrency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "exercised" BOOLEAN,
    "settlementPrice" DOUBLE PRECISION,
    "outputAmount" DOUBLE PRECISION,
    "outputCurrency" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trades_status_expiryTime_idx" ON "trades"("status", "expiryTime");

-- CreateIndex
CREATE INDEX "trades_parentId_idx" ON "trades"("parentId");

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "trades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
