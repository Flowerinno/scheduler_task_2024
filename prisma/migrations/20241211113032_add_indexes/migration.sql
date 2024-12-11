-- CreateIndex
CREATE INDEX "Notification_userId_projectId_sentById_idx" ON "Notification"("userId", "projectId", "sentById");
