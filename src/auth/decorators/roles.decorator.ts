import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enums/roles.enum';

export const ROLE_KEY = 'roles';

export const ROLES = (...role: Role[]) => SetMetadata(ROLE_KEY, role);
