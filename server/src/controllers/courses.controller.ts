import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CoursesService } from '../services/courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  AddStudentDto,
} from '../dto/courses.dto';
import { ClassesService } from '../services/classes.service';
import { Authenticated } from '../auth/authenticated.decorator';
import { Role } from '../../prisma/generated/prisma/enums';
import { Request } from 'express';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly classesService: ClassesService,
  ) { }

  @Post()
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({
    description: 'Course data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Introduction to Computer Science' },
        description: {
          type: 'string',
          example: 'Basic concepts of programming',
        },
        schedules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dayOfWeek: { type: 'number', example: 1 },
              startTime: { type: 'string', example: '08:00' },
              endTime: { type: 'string', example: '10:00' },
            },
          },
        },
        emails: {
          type: 'array',
          items: { type: 'string', format: 'email' },
          example: ['student1@example.com'],
        },
      },
      required: ['name', 'teacherId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  create(@Body() createCourseDto: CreateCourseDto, @Req() { user }: Request) {
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Get()
  @Authenticated()
  @ApiResponse({
    status: 200,
    description: 'List of all courses with teachers and students',
  })
  findAll(@Req() { user }: Request) {
    return this.coursesService.findAll(
      user.role === Role.STUDENT ? user.id : undefined,
      user.role === Role.TEACHER ? user.id : undefined,
    );
  }

  @Get(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string, @Req() { user }: Request) {
    return this.coursesService.findOne(id, user);
  }

  @Patch(':id')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Course data to update',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Advanced Computer Science' },
        description: {
          type: 'string',
          example: 'Advanced programming concepts',
        },
        teacherId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Req() { user }: Request) {
    return this.coursesService.update(id, updateCourseDto, user.id);
  }

  @Delete(':id')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id') id: string, @Req() { user }: Request) {
    return this.coursesService.remove(id, user.id);
  }

  @Post(':id/students')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Add a student to a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Student to add',
    schema: {
      type: 'object',
      properties: {
        studentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174001',
        },
      },
      required: ['studentId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student added to course successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Student already enrolled or user is not a student',
  })
  @ApiResponse({ status: 404, description: 'Course or student not found' })
  addStudent(@Param('id') id: string, @Body() addStudentDto: AddStudentDto, @Req() { user }: Request) {
    return this.coursesService.addStudent(id, addStudentDto, user.id);
  }

  @Get(':id/students')
  @Authenticated()
  @ApiOperation({ summary: 'Get all students of a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of students in the course',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findStudents(@Param('id') id: string, @Req() { user }: Request) {
    return this.coursesService.findStudents(id, user);
  }

  @Post(':id/students/batch')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Add multiple students to a course by email' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'List of student emails',
    schema: {
      type: 'object',
      properties: {
        emails: {
          type: 'array',
          items: {
            type: 'string',
            format: 'email',
          },
          example: ['student1@example.com', 'student2@example.com'],
        },
      },
      required: ['emails'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Students added to course successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No valid students found or all already enrolled',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  addStudentsByEmail(
    @Param('id') id: string,
    @Body() body: { emails: string[] },
    @Req() { user }: Request,
  ) {
    return this.coursesService.addStudentsByEmail(id, body.emails, user.id);
  }

  @Delete(':id/students/:studentId')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Remove a student from a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 200,
    description: 'Student removed from course successfully',
  })
  @ApiResponse({ status: 404, description: 'Course or enrollment not found' })
  removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() { user }: Request,
  ) {
    return this.coursesService.removeStudent(id, studentId, user.id);
  }

  @Get(':id/classes')
  @Authenticated()
  @ApiOperation({ summary: 'Get all classes of a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all classes in the course',
  })
  findClasses(@Param('id') id: string) {
    return this.classesService.findAllByCourse(id);
  }

  @Post(':id/invite/regenerate')
  @Authenticated(Role.TEACHER)
  @ApiOperation({ summary: 'Regenerate the invite code for a course' })
  @ApiParam({
    name: 'id',
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Invite code regenerated successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized to modify this course' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  regenerateInviteCode(@Param('id') id: string, @Req() { user }: Request) {
    return this.coursesService.regenerateInviteCode(id, user.id);
  }

  @Post('join')
  @Authenticated(Role.STUDENT)
  @ApiOperation({ summary: 'Join a course using an invite code' })
  @ApiBody({
    description: 'Invite Code',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'A1B2C3D4',
        },
      },
      required: ['code'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student successfully joined the course',
  })
  @ApiResponse({ status: 400, description: 'Invalid code or already enrolled' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  enrollWithCode(@Body() body: { code: string }, @Req() { user }: Request) {
    return this.coursesService.enrollWithCode(body.code, user.id);
  }
}
