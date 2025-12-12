import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateStudentDto } from './dto/student/create-student.dto';
import { UpdateStudentDto } from './dto/student/update-student.dto';
import { StudentResponseDto } from './dto/student/student-response.dto';

/**
 * Service that wraps Prisma operations for the Student model.
 *
 * Provides basic CRUD methods used by controllers.
 */
@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new student.
   */
  async create(
    createStudentDto: CreateStudentDto,
  ): Promise<StudentResponseDto> {
    const created = await this.prisma.student.create({
      data: {
        matricula: createStudentDto.matricula,
        name: createStudentDto.name,
      },
    });

    return new StudentResponseDto(created);
  }

  /**
   * Return all students.
   */
  async findAll(): Promise<StudentResponseDto[]> {
    const students = await this.prisma.student.findMany();
    return students.map((s) => new StudentResponseDto(s));
  }

  /**
   * Return a student by id or throw NotFoundException.
   */
  async findOne(id: number): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return new StudentResponseDto(student);
  }

  /**
   * Update a student. Throws NotFoundException if the student does not exist.
   */
  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        name: updateStudentDto.name,
        matricula: updateStudentDto.matricula,
      },
    });

    return new StudentResponseDto(updated);
  }

  /**
   * Remove a student. Throws NotFoundException if the student does not exist.
   */
  async remove(id: number): Promise<StudentResponseDto> {
    // Ensure the student exists so the delete call won't fail with a generic DB error
    await this.findOne(id);

    const deleted = await this.prisma.student.delete({
      where: { id },
    });

    return new StudentResponseDto(deleted);
  }
}
