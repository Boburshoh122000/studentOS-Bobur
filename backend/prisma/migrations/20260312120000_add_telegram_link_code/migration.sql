-- AlterTable: add telegram link code and username fields to User
ALTER TABLE "User" ADD COLUMN "telegramUsername" TEXT;
ALTER TABLE "User" ADD COLUMN "telegramLinkCode" TEXT;
ALTER TABLE "User" ADD COLUMN "telegramLinkCodeExpiry" TIMESTAMP(3);
