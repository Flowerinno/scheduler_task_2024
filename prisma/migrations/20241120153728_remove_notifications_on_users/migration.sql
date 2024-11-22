/*
  Warnings:

  - You are about to drop the `NotificationsOnUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotificationsOnUsers" DROP CONSTRAINT "NotificationsOnUsers_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationsOnUsers" DROP CONSTRAINT "NotificationsOnUsers_userId_fkey";

-- DropTable
DROP TABLE "NotificationsOnUsers";
