import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';

export interface CreateClassDto {
  topic: string;
  date: Date;
  courseId: string;
}

export interface UpdateClassDto {
  topic?: string;
  date?: Date;
  courseId?: string;
}

export interface RegisterAttendanceDto {
  studentId: string;
}

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(data: CreateClassDto) {
    return this.prisma.class.create({
      data,
      include: {
        course: true,
        attendances: true,
      },
    });
  }

  async findAllByCourse(courseId: string) {
    return this.prisma.class.findMany({
      where: { courseId },
      include: {
        course: true,
        attendances: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id },
      include: {
        course: true,
        attendances: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async update(id: string, data: UpdateClassDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        course: true,
        attendances: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.class.delete({
      where: { id },
    });
  }

  async registerAttendance(classId: string, data: RegisterAttendanceDto) {
    // Verify class exists
    const classEntity = await this.findOne(classId);

    // Verify student exists and has STUDENT role
    await this.usersService.findStudent(data.studentId);

    // Verify student is enrolled in the course
    const enrollment = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.studentId,
          courseId: classEntity.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        `Student with ID ${data.studentId} is not enrolled in the course for this class`,
      );
    }

    // Check if attendance already registered
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: data.studentId,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Attendance already registered for this student in this class');
    }

    return this.prisma.attendance.create({
      data: {
        classId,
        studentId: data.studentId,
      },
      include: {
        student: true,
        class: true,
      },
    });
  }

  async removeAttendance(classId: string, studentId: string) {
    // Verify class exists
    await this.findOne(classId);

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found for this student in this class');
    }

    return this.prisma.attendance.delete({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });
  }
}
