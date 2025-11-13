/*
  Warnings:

  - You are about to drop the `_EventToLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LogToProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_EventToLog" DROP CONSTRAINT "_EventToLog_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventToLog" DROP CONSTRAINT "_EventToLog_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LogToProject" DROP CONSTRAINT "_LogToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LogToProject" DROP CONSTRAINT "_LogToProject_B_fkey";

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "projectId" INTEGER;

-- DropTable
DROP TABLE "public"."_EventToLog";

-- DropTable
DROP TABLE "public"."_LogToProject";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
