-- AlterTable: add referral system and telegram credits tracking
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telegramCredited" BOOLEAN NOT NULL DEFAULT false;

-- Create unique index for referralCode
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- Create index for faster referral lookups
CREATE INDEX IF NOT EXISTS "User_referralCode_idx" ON "User"("referralCode");
