import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  AddStudentDto,
} from '../dto/courses.dto';
import { User } from '../../prisma/generated/prisma/client';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) { }

  private generateRandomCode(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

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
      await this.addStudentsByEmail(course.id, emails, teacherId);
    }

    return course;
  }

  async findAll(studentId?: string, teacherId?: string) {
    const where: any = {};
    if (studentId) {
      where.students = { some: { studentId } };
    }
    if (teacherId) {
      where.teacherId = teacherId;
    }

    const courses = await this.prisma.course.findMany({
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

    // If teacher (no studentId filter), check for active class today
    if (!studentId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const coursesWithActive = await Promise.all(
        courses.map(async (course) => {
          const activeClass = await this.prisma.class.findFirst({
            where: {
              courseId: course.id,
              date: {
                gte: today,
                lt: tomorrow,
              },
            },
            orderBy: {
              date: 'desc',
            },
            select: { id: true },
          });

          const lastClass = await this.prisma.class.findFirst({
            where: {
              courseId: course.id,
            },
            orderBy: {
              date: 'desc',
            },
            select: { id: true },
          });

          return {
            ...course,
            activeClassId: activeClass?.id || null,
            lastClassId: lastClass?.id || null,
          };
        }),
      );

      return coursesWithActive;
    }

    return courses;
  }

  async findById(id: string) {
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
        classes: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findOne(id: string, user: User) {
    const course = await this.findById(id);

    if (user.role === 'TEACHER') {
      if (course.teacherId !== user.id) {
        throw new ForbiddenException('You are not the teacher of this course');
      }
      return course;
    }

    if (user.role === 'STUDENT') {
      const isEnrolled = (course as any).students.some((s: any) => s.studentId === user.id);
      if (!isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this course');
      }

      // Fetch classes with attendance status for this student
      const classesWithAttendance = await this.prisma.class.findMany({
        where: { courseId: id },
        include: {
          attendances: {
            where: { studentId: user.id },
          },
        },
      });

      return {
        ...course,
        classes: classesWithAttendance.map((c) => ({
          ...c,
          present: c.attendances.length > 0,
        })),
      };
    }

    throw new ForbiddenException();
  }

  async update(id: string, data: UpdateCourseDto, teacherId: string) {
    const course = await this.findById(id);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    return this.prisma.course.update({
      where: { id },
      data,
      include: {
        teacher: true,
        students: true,
      },
    });
  }

  async remove(id: string, teacherId: string) {
    const course = await this.findById(id);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async addStudent(courseId: string, data: AddStudentDto, teacherId: string) {
    // Verify course exists
    const course = await this.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('You can only add students to your own courses');
    }

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

  async removeStudent(courseId: string, studentId: string, teacherId: string) {
    // Verify course exists
    const course = await this.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('You can only remove students from your own courses');
    }

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

  async regenerateInviteCode(courseId: string, teacherId: string) {
    const course = await this.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('You can only modify your own courses');
    }

    let inviteCode = this.generateRandomCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await this.prisma.course.findUnique({ where: { inviteCode } });
      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = this.generateRandomCode();
      }
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { inviteCode },
      select: { inviteCode: true },
    });
  }

  async enrollWithCode(inviteCode: string, studentId: string) {
    const course = await this.prisma.course.findUnique({
      where: { inviteCode },
    });

    if (!course) {
      throw new NotFoundException('Invalid invite code');
    }

    await this.usersService.findStudent(studentId);

    const existing = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Student is already enrolled in this course');
    }

    return this.prisma.studentCourse.create({
      data: {
        studentId,
        courseId: course.id,
      },
      include: {
        course: true,
      },
    });
  }

  async addStudentsByEmail(courseId: string, emails: string[], teacherId: string) {
    // Verify course exists
    const course = await this.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('You can only add students to your own courses');
    }

    // Validate emails and prepare user data
    const validEmails = new Set<string>();
    const usersToCreate: { email: string; name: string; role: any }[] = [];

    for (const email of emails) {
      try {
        const role = this.usersService.validateEmailAndGetRole(email);
        validEmails.add(email);

        // Prepare data for potential creation
        // STRICT CHECK: Only add if role is STUDENT
        // "Ele também não pode adicionar um email q não seja ccc como estudante"
        if (role === 'STUDENT') {
          usersToCreate.push({
            email,
            name: this.usersService.inferNameFromEmail(email),
            role,
          });
        }
      } catch (_error) {
        // Log or ignore invalid emails?
        // For now, ignoring invalid emails to allow partial success,
        // or should we fail?
        // If the user expects strict validation, maybe we should filter them out.
        // The implementation implies we only process valid ones.
      }
    }

    if (validEmails.size === 0) {
      throw new BadRequestException('No valid @ufcg.edu.br emails provided');
    }

    // Find existing users
    const existingUsers = await this.prisma.user.findMany({
      where: {
        email: {
          in: Array.from(validEmails),
        },
      },
    });

    const existingEmails = new Set(existingUsers.map((u) => u.email));
    const missingEmails = usersToCreate.filter(
      (u) => !existingEmails.has(u.email),
    );

    // Create missing users
    const newStudents = await Promise.all(
      missingEmails.map((u) =>
        this.prisma.user.create({
          data: {
            email: u.email,
            name: u.name,
            password: '',
            role: u.role,
          },
        }),
      ),
    );

    // Combine all users (existing + new)
    // Filter existing users to ensure they are actually students
    // "Ele também não pode adicionar um email q não seja ccc como estudante"
    const validExistingUsers = existingUsers.filter(
      (u) => u.role === 'STUDENT',
    );

    const allUsersToAdd = [...validExistingUsers, ...newStudents];

    if (allUsersToAdd.length === 0) {
      throw new BadRequestException('No valid users found or created');
    }

    const userIds = allUsersToAdd.map((s) => s.id);

    // Check which students are already enrolled
    const existingEnrollments = await this.prisma.studentCourse.findMany({
      where: {
        courseId,
        studentId: {
          in: userIds,
        },
      },
      include: {
        student: true,
      },
    });

    const enrolledUserIds = new Set(
      existingEnrollments.map((e) => e.studentId),
    );

    // Filter out users already enrolled
    const studentsToEnroll = allUsersToAdd.filter(
      (s) => !enrolledUserIds.has(s.id),
    );

    if (studentsToEnroll.length === 0) {
      return { message: 'All users are already enrolled', added: [] };
    }

    // Bulk create enrollments
    await this.prisma.studentCourse.createMany({
      data: studentsToEnroll.map((s) => ({
        courseId,
        studentId: s.id,
      })),
      skipDuplicates: true,
    });

    return {
      message: `${studentsToEnroll.length} students added successfully`,
      added: studentsToEnroll.map((s) => s.email),
    };
  }

  async findStudents(courseId: string, user: any) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: true,
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role === 'TEACHER') {
      if (course.teacherId !== user.id) {
        throw new ForbiddenException();
      }
    } else if (user.role === 'STUDENT') {
      const isEnrolled = course.students.some((s) => s.studentId === user.id);
      if (!isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    } else {
      throw new ForbiddenException();
    }

    const students = await this.prisma.studentCourse.findMany({
      where: { courseId },
      include: {
        student: true,
      },
    });

    return students.map((s) => s.student);
  }
}
