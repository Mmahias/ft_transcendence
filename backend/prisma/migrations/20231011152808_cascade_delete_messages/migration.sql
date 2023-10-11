-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_channelId_fkey";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
