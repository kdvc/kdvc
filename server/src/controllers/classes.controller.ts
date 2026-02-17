import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ClassesService } from '../services/classes.service';
import {
  CreateClassDto,
  UpdateClassDto,
  RegisterAttendanceDto,
} from '../dto/classes.dto';
import { Authenticated } from '../auth/authenticated.decorator';
import { Role } from '../../prisma/generated/prisma/enums';
import { Request } from 'express';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Create a new class session' })
  @ApiBody({
    description: 'Class data',
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', example: 'Introduction to Variables' },
        date: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:00:00Z',
        },
        courseId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['topic', 'date', 'courseId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Class found with course and attendance details',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Update a class' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Class data to update',
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', example: 'Advanced Variables' },
        date: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T14:00:00Z',
        },
        courseId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Delete a class' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  @Post(':id/attendance')
  @Authenticated()
  @ApiOperation({
    summary:
      'Register student attendance. Teachers provide studentId; students are registered automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description:
      'Student attendance data (studentId optional for students — uses own ID)',
    schema: {
      type: 'object',
      properties: {
        studentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174001',
          description: 'Required for teachers, ignored for students',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Attendance registered successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Student not enrolled in course or attendance already registered',
  })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  registerAttendance(
    @Param('id') id: string,
    @Body() body: RegisterAttendanceDto,
    @Req() req: Request,
  ) {
    let studentId: string;

    if (req.user.role === Role.STUDENT) {
      studentId = req.user.id;
    } else {
      if (!body.studentId) {
        throw new BadRequestException(
          'studentId is required for teacher requests',
        );
      }
      studentId = body.studentId;
    }

    return this.classesService.registerAttendance(id, { studentId });
  }

  @Delete(':id/attendance/:studentId')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Remove student attendance from a class' })
  @ApiParam({
    name: 'id',
    description: 'Class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({ status: 200, description: 'Attendance removed successfully' })
  @ApiResponse({ status: 404, description: 'Class or attendance not found' })
  removeAttendance(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.removeAttendance(id, studentId);
  }
}
