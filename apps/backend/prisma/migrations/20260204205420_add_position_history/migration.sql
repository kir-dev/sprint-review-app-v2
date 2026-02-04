-- CreateTable
CREATE TABLE "PositionHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "position" "Position" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "PositionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PositionHistory" ADD CONSTRAINT "PositionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
