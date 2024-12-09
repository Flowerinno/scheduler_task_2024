/*
  Warnings:

  - Added the required column `projectId` to the `ClientsOnTags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ClientsOnTags_clientId_tagId_idx";

-- AlterTable
ALTER TABLE "ClientsOnTags" ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ClientsOnTags_clientId_tagId_projectId_idx" ON "ClientsOnTags"("clientId", "tagId", "projectId");
