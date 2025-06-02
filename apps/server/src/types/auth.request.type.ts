// src/common/types/auth-request.type.ts
import { Request } from 'express';
import { Session } from '@prisma/client'; // jeśli używasz modelu Session w bazie
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User; // dodany przez guard po weryfikacji accessToken
  session?: Session; // przypisany w middleware/guardach przy refresh
}
