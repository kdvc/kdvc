import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { UsersService } from '../services/users.service';
import { PrismaService } from '../database/prisma.service';

describe('AuthModule', () => {
  it('should compile', async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(UsersService)
      .useValue({})
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(module).toBeDefined();
  });
});
