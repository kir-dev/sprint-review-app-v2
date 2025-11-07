/*
  Warnings:

  - You are about to drop the column `projectId` on the `Log` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('KIR_DEV', 'SIMONYI');

-- DropForeignKey
ALTER TABLE "public"."Log" DROP CONSTRAINT "Log_projectId_fkey";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "projectId";

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToLog" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventToLog_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LogToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LogToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventToLog_B_index" ON "_EventToLog"("B");

-- CreateIndex
CREATE INDEX "_LogToProject_B_index" ON "_LogToProject"("B");

-- AddForeignKey
ALTER TABLE "_EventToLog" ADD CONSTRAINT "_EventToLog_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToLog" ADD CONSTRAINT "_EventToLog_B_fkey" FOREIGN KEY ("B") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LogToProject" ADD CONSTRAINT "_LogToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LogToProject" ADD CONSTRAINT "_LogToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
