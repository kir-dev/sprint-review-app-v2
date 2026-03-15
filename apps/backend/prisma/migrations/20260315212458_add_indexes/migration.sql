-- CreateIndex
CREATE INDEX "Log_userId_workPeriodId_idx" ON "Log"("userId", "workPeriodId");

-- CreateIndex
CREATE INDEX "Log_projectId_workPeriodId_idx" ON "Log"("projectId", "workPeriodId");

-- CreateIndex
CREATE INDEX "Log_eventId_idx" ON "Log"("eventId");

-- CreateIndex
CREATE INDEX "Log_date_idx" ON "Log"("date");

-- CreateIndex
CREATE INDEX "PositionHistory_userId_idx" ON "PositionHistory"("userId");
