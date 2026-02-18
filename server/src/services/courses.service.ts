import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  AddStudentDto,
} from '../dto/courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(courseData: CreateCourseDto, teacherId: string) {
    await this.usersService.findTeacher(teacherId);

    const { emails, schedules, ...rest } = courseData;

    const course = await this.prisma.course.create({
      data: {
        ...rest,
        teacherId,
        schedules: schedules
          ? {
              create: schedules.map((s) => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
              })),
            }
          : undefined,
      },
      include: {
        teacher: true,
        students: true,
        schedules: true,
      },
    });

    if (emails && emails.length > 0) {
      await this.addStudentsByEmail(course.id, emails);
    }

    return course;
  }

  async findAll(studentId?: string) {
    const where = studentId ? { students: { some: { studentId } } } : {}; // sem filtro se undefined

    return this.prisma.course.findMany({
      where,
      include: {
        teacher: true,
        students: {
          include: {
            student: true,
          },
        },
        schedules: true,
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: {
          include: {
            student: true,
          },
        },
        schedules: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, data: UpdateCourseDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.course.update({
      where: { id },
      data,
      include: {
        teacher: true,
        students: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async addStudent(courseId: string, data: AddStudentDto) {
    // Verify course exists
    await this.findOne(courseId);

    // Verify student exists and has STUDENT role
    await this.usersService.findStudent(data.studentId);

    // Check if already enrolled
    const existing = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.studentId,
          courseId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Student is already enrolled in this course',
      );
    }

    return this.prisma.studentCourse.create({
      data: {
        studentId: data.studentId,
        courseId,
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  async removeStudent(courseId: string, studentId: string) {
    // Verify course exists
    await this.findOne(courseId);

    const enrollment = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Student is not enrolled in this course');
    }

    return this.prisma.studentCourse.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
  }

  async addStudentsByEmail(courseId: string, emails: string[]) {
    // Verify course exists
    await this.findOne(courseId);

    // Find users by emails
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });

    // Filter users that are students
    const students = users.filter((user) => user.role === 'STUDENT');

    if (students.length === 0) {
      throw new BadRequestException(
        'No valid students found with the provided emails',
      );
    }

    const studentIds = students.map((s) => s.id);

    // Check which students are already enrolled
    const existingEnrollments = await this.prisma.studentCourse.findMany({
      where: {
        courseId,
        studentId: {
          in: studentIds,
        },
      },
    });

    const enrolledStudentIds = new Set(
      existingEnrollments.map((e) => e.studentId),
    );

    // Filter out students already enrolled
    const studentsToAdd = students.filter((s) => !enrolledStudentIds.has(s.id));

    if (studentsToAdd.length === 0) {
      return { message: 'All students are already enrolled', added: [] };
    }

    // Bulk create enrollments
    await this.prisma.studentCourse.createMany({
      data: studentsToAdd.map((s) => ({
        courseId,
        studentId: s.id,
      })),
      skipDuplicates: true,
    });

    return {
      message: `${studentsToAdd.length} students added successfully`,
      added: studentsToAdd.map((s) => s.email),
    };
  }
}
