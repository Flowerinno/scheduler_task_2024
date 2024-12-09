/*
  Warnings:

  - You are about to drop the column `userId` on the `ClientsOnProjects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ClientsOnProjects" DROP CONSTRAINT "ClientsOnProjects_userId_fkey";

-- DropIndex
DROP INDEX "ClientsOnProjects_userId_projectId_idx";

-- AlterTable
ALTER TABLE "ClientsOnProjects" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "ClientsOnUsers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClientsOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientsOnUsers_clientId_userId_idx" ON "ClientsOnUsers"("clientId", "userId");

-- CreateIndex
CREATE INDEX "ClientsOnProjects_projectId_clientId_idx" ON "ClientsOnProjects"("projectId", "clientId");

-- AddForeignKey
ALTER TABLE "ClientsOnUsers" ADD CONSTRAINT "ClientsOnUsers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientsOnUsers" ADD CONSTRAINT "ClientsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
