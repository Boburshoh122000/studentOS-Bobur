-- AlterTable: Add Instagram, Telegram, GitHub social links to TeamMember
ALTER TABLE "TeamMember"
ADD COLUMN IF NOT EXISTS "socialInstagram" TEXT,
    ADD COLUMN IF NOT EXISTS "socialTelegram" TEXT,
    ADD COLUMN IF NOT EXISTS "socialGithub" TEXT;