import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  CoursesService,
  CreateCourseDto,
  UpdateCourseDto,
  AddStudentDto,
} from '../services/courses.service';
import { ClassesService } from '../services/classes.service';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly classesService: ClassesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({
    description: 'Course data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Introduction to Computer Science' },
        description: { type: 'string', example: 'Basic concepts of programming' },
        teacherId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
      required: ['name', 'teacherId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of all courses with teachers and students' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({
    description: 'Course data to update',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Advanced Computer Science' },
        description: { type: 'string', example: 'Advanced programming concepts' },
        teacherId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/students')
  @ApiOperation({ summary: 'Add a student to a course' })
  @ApiParam({ name: 'id', description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({
    description: 'Student to add',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
      },
      required: ['studentId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Student added to course successfully' })
  @ApiResponse({ status: 400, description: 'Student already enrolled or user is not a student' })
  @ApiResponse({ status: 404, description: 'Course or student not found' })
  addStudent(@Param('id') id: string, @Body() addStudentDto: AddStudentDto) {
    return this.coursesService.addStudent(id, addStudentDto);
  }

  @Delete(':id/students/:studentId')
  @ApiOperation({ summary: 'Remove a student from a course' })
  @ApiParam({ name: 'id', description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiParam({ name: 'studentId', description: 'Student ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  @ApiResponse({ status: 200, description: 'Student removed from course successfully' })
  @ApiResponse({ status: 404, description: 'Course or enrollment not found' })
  removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return this.coursesService.removeStudent(id, studentId);
  }

  @Get(':id/classes')
  @ApiOperation({ summary: 'Get all classes of a course' })
  @ApiParam({ name: 'id', description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'List of all classes in the course' })
  findClasses(@Param('id') id: string) {
    return this.classesService.findAllByCourse(id);
  }
}
