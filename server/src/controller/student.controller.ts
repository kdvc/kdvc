import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { StudentService } from '../domain/student.service';
import { CreateStudentDto } from '../domain/dto/student/create-student.dto';
import { UpdateStudentDto } from '../domain/dto/student/update-student.dto';
import { StudentResponseDto } from '../domain/dto/student/student-response.dto';
import { IdParamDto } from '../domain/dto/common/id.param.dto';

@Controller('/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async findAll(): Promise<StudentResponseDto[]> {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto): Promise<StudentResponseDto> {
    return this.studentService.findOne(params.id);
  }

  @Post()
  async create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    return this.studentService.create(dto);
  }

  @Put(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.studentService.update(params.id, dto);
  }

  @Delete(':id')
  async remove(@Param() params: IdParamDto): Promise<StudentResponseDto> {
    return this.studentService.remove(params.id);
  }
}
