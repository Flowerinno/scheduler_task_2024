/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `ClientsOnProjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClientsOnProjects_clientId_key" ON "ClientsOnProjects"("clientId");
