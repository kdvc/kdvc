import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, UsersService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
