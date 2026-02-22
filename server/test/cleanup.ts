import { PrismaService } from '../src/database/prisma.service';

export async function cleanupDatabase(prisma: PrismaService) {
    // Delete in reverse order of dependencies
    await prisma.attendance.deleteMany();
    await prisma.class.deleteMany();
    await prisma.courseSchedule.deleteMany();
    await prisma.studentCourse.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
}
