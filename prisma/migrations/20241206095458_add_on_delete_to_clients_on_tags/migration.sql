-- DropForeignKey
ALTER TABLE "ClientsOnTags" DROP CONSTRAINT "ClientsOnTags_tagId_fkey";

-- AddForeignKey
ALTER TABLE "ClientsOnTags" ADD CONSTRAINT "ClientsOnTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
