-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_clientId_fkey";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
