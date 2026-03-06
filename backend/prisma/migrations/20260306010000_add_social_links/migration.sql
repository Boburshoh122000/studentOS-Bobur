-- AlterTable
ALTER TABLE "EmployerProfile"
ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT '[]';