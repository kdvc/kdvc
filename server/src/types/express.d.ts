import { User as PrismaUser } from '../../prisma/generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      user: PrismaUser;
    }
  }
}
