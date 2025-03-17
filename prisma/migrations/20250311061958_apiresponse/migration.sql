-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "deviceType" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "version" TEXT,
    "model" TEXT,
    "uniqueId" TEXT,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiResponseTime" (
    "id" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiResponseTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_uniqueId_key" ON "UserDevice"("userId", "uniqueId");

-- CreateIndex
CREATE INDEX "ApiResponseTime_apiName_idx" ON "ApiResponseTime"("apiName");

-- CreateIndex
CREATE INDEX "ApiResponseTime_createdAt_idx" ON "ApiResponseTime"("createdAt");

-- CreateIndex
CREATE INDEX "ApiResponseTime_duration_idx" ON "ApiResponseTime"("duration");

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
