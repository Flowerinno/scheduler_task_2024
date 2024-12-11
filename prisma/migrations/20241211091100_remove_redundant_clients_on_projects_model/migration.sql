/*
  Warnings:

  - You are about to drop the `ClientsOnProjects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `projectId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientsOnProjects" DROP CONSTRAINT "ClientsOnProjects_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientsOnProjects" DROP CONSTRAINT "ClientsOnProjects_projectId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "projectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ClientsOnProjects";

-- CreateIndex
CREATE INDEX "Client_projectId_userId_idx" ON "Client"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
