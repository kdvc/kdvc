-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "inviteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Course_inviteCode_key" ON "Course"("inviteCode");
