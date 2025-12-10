import { CreateClassDto } from './dto/class/create-class.dto'
import { ClassController } from './controller/class/class.controller'
import { Module } from '@nestjs/common';

@Module({
  imports: [ CreateClassDto ],
  providers: [],
  controllers: [ ClassController ],
})
export class AppModule {}
