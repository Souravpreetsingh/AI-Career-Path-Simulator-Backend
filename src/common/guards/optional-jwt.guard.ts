import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../utils/types';
import { UserRole } from '../utils/roles.enum';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtPayload>(err: any, user: any, info: any, context: ExecutionContext): TUser {
    if (user) return user;
    const guestPayload: JwtPayload = {
      sub: 'guest',
      email: 'guest@careerpath.ai',
      role: UserRole.STUDENT,
    };
    const request = context.switchToHttp().getRequest();
    request.user = guestPayload;
    return guestPayload as unknown as TUser;
  }
}
