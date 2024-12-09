-- DropForeignKey
ALTER TABLE "ClientsOnProjects" DROP CONSTRAINT "ClientsOnProjects_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ClientsOnProjects" ADD CONSTRAINT "ClientsOnProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
