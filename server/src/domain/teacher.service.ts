import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTeacherDto } from './dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from './dto/teacher/update-teacher.dto';
import { TeacherResponseDto } from './dto/teacher/teacher-response.dto';

/**
 * Service that wraps Prisma operations for the Teacher model.
 *
 * Provides basic CRUD methods used by controllers.
 */
@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new teacher.
   */
  async create(
    createTeacherDto: CreateTeacherDto,
  ): Promise<TeacherResponseDto> {
    const created = await this.prisma.teacher.create({
      data: {
        matricula: createTeacherDto.matricula,
        name: createTeacherDto.name,
      },
    });

    return new TeacherResponseDto(created);
  }

  /**
   * Return all teachers.
   */
  async findAll(): Promise<TeacherResponseDto[]> {
    const teachers = await this.prisma.teacher.findMany();
    return teachers.map((t) => new TeacherResponseDto(t));
  }

  /**
   * Return a teacher by id or throw NotFoundException.
   */
  async findOne(id: number): Promise<TeacherResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return new TeacherResponseDto(teacher);
  }

  /**
   * Update a teacher. Throws NotFoundException if the teacher does not exist.
   */
  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.teacher.update({
      where: { id },
      data: {
        name: updateTeacherDto.name,
        matricula: updateTeacherDto.matricula,
      },
    });

    return new TeacherResponseDto(updated);
  }

  /**
   * Remove a teacher. Throws NotFoundException if the teacher does not exist.
   */
  async remove(id: number): Promise<TeacherResponseDto> {
    // Ensure the teacher exists so the delete call won't fail with a generic DB error
    await this.findOne(id);

    const deleted = await this.prisma.teacher.delete({
      where: { id },
    });

    return new TeacherResponseDto(deleted);
  }
}
