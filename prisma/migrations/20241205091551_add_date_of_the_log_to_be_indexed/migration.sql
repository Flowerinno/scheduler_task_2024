-- DropIndex
DROP INDEX "Log_clientId_projectId_createdAt_modifiedById_idx";

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Log_clientId_projectId_createdAt_modifiedById_date_idx" ON "Log"("clientId", "projectId", "createdAt", "modifiedById", "date");
