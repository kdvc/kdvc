-- AlterTable
CREATE SEQUENCE student_id_seq;
ALTER TABLE "Student" ALTER COLUMN "id" SET DEFAULT nextval('student_id_seq');
ALTER SEQUENCE student_id_seq OWNED BY "Student"."id";

-- AlterTable
CREATE SEQUENCE teacher_id_seq;
ALTER TABLE "Teacher" ALTER COLUMN "id" SET DEFAULT nextval('teacher_id_seq');
ALTER SEQUENCE teacher_id_seq OWNED BY "Teacher"."id";
