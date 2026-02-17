import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Role } from '../../prisma/generated/prisma/client';
import { AuthGuard, ROLES_KEY } from './guards/auth.guard';

export const Authenticated = (role?: Role) => {
  return applyDecorators(SetMetadata(ROLES_KEY, role), UseGuards(AuthGuard));
};
