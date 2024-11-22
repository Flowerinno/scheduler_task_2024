/*
  Warnings:

  - Made the column `clientId` on table `ClientsOnProjects` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ClientsOnProjects" DROP CONSTRAINT "ClientsOnProjects_clientId_fkey";

-- AlterTable
ALTER TABLE "ClientsOnProjects" ALTER COLUMN "clientId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ClientsOnProjects" ADD CONSTRAINT "ClientsOnProjects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
