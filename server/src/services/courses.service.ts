import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';

export interface CreateCourseDto {
  name: string;
  description?: string;
  teacherId: string;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  teacherId?: string;
}

export interface AddStudentDto {
  studentId: string;
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(data: CreateCourseDto) {
    return this.prisma.course.create({
      data,
      include: {
        teacher: true,
        students: true,
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        teacher: true,
        students: {
          include: {
            student: true,
          },
        },
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
      throw new BadRequestException('Student is already enrolled in this course');
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
}
