/*
  Warnings:

  - You are about to drop the `ClientsOnUsers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientsOnUsers" DROP CONSTRAINT "ClientsOnUsers_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientsOnUsers" DROP CONSTRAINT "ClientsOnUsers_userId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ClientsOnUsers";

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
