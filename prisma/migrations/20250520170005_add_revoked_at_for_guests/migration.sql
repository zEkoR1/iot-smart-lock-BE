-- AlterTable
ALTER TABLE "UserDevice" ADD COLUMN     "revokedAt" TIMESTAMP(3) DEFAULT (now() + '24:00:00'::interval);
