-- AlterTable
ALTER TABLE "User" ADD COLUMN "authSchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_authSchId_key" ON "User"("authSchId");
