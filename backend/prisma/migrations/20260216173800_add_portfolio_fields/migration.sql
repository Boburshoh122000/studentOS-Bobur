-- AlterTable
ALTER TABLE "StudentProfile"
ADD COLUMN "headline" TEXT;
ALTER TABLE "StudentProfile"
ADD COLUMN "educationHistory" JSONB;
ALTER TABLE "StudentProfile"
ADD COLUMN "workExperience" JSONB;