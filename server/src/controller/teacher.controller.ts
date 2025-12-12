import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TeacherService } from '../domain/teacher.service';
import { CreateTeacherDto } from '../domain/dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../domain/dto/teacher/update-teacher.dto';
import { TeacherResponseDto } from '../domain/dto/teacher/teacher-response.dto';
import { IdParamDto } from '../domain/dto/common/id.param.dto';

@Controller('/teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  async findAll(): Promise<TeacherResponseDto[]> {
    return this.teacherService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto): Promise<TeacherResponseDto> {
    return this.teacherService.findOne(params.id);
  }

  @Post()
  async create(@Body() dto: CreateTeacherDto): Promise<TeacherResponseDto> {
    return this.teacherService.create(dto);
  }

  @Put(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() dto: UpdateTeacherDto,
  ): Promise<TeacherResponseDto> {
    return this.teacherService.update(params.id, dto);
  }

  @Delete(':id')
  async remove(@Param() params: IdParamDto): Promise<TeacherResponseDto> {
    return this.teacherService.remove(params.id);
  }
}
