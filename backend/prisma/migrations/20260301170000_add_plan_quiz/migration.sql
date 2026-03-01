-- CreateTable
CREATE TABLE "PlanQuiz" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlanQuiz_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT [],
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "userAnswer" INTEGER,
    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "PlanQuiz_phaseId_key" ON "PlanQuiz"("phaseId");
-- CreateIndex
CREATE INDEX "PlanQuiz_phaseId_idx" ON "PlanQuiz"("phaseId");
-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");
-- AddForeignKey
ALTER TABLE "PlanQuiz"
ADD CONSTRAINT "PlanQuiz_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "PlanPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "QuizQuestion"
ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "PlanQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;