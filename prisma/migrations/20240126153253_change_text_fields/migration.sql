-- AlterTable
ALTER TABLE "Challenge" ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "body" DROP NOT NULL,
ALTER COLUMN "body" SET DATA TYPE TEXT;
