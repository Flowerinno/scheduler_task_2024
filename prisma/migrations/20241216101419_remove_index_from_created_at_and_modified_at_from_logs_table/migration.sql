-- DropIndex
DROP INDEX "Log_clientId_projectId_createdAt_modifiedById_date_idx";

-- CreateIndex
CREATE INDEX "Log_clientId_projectId_date_idx" ON "Log"("clientId", "projectId", "date");
