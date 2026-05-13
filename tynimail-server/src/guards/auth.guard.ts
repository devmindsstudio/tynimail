import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@/modules/jwt';
import { error as errorResponse } from '@/responses';
import { UsersService } from '@/modules/users';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AuthGuard {
  private usersService: UsersService;
  constructor(
    private readonly jwtService: JwtService,
    private readonly moduleRef: ModuleRef,
  ) { }

  onModuleInit() {
    this.usersService = this.moduleRef.get(UsersService, { strict: false });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(errorResponse('Authorization token not found', 'AUTHENTICATION-ERROR'));
    }

    try {
      const payload = await this.jwtService.verifyAccessToken(token);
      request.user = payload;
      await this.checkIfUserAllowed(payload.sub);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(
          errorResponse(error.message, 'USER-NOT-FOUND'),
        );
      } else {
        throw new UnauthorizedException(errorResponse('Invalid or expired authorization token', 'AUTHENTICATION-ERROR'));
      }
    }
  }

  private async checkIfUserAllowed(userId: string): Promise<void> {
    const checkIfUserDeletedAlready = await this.usersService.checkIfUserSoftDeleteUserAccount(userId);
    if (checkIfUserDeletedAlready)
      throw new ForbiddenException('User not found');

    const checkIfUserIdExists = await this.usersService.checkIfUserExists(userId);
    if (!checkIfUserIdExists) throw new ForbiddenException('User not found');

    const checkIfUserSuspended = await this.usersService.checkIfUserIsSuspended(userId);
    if (checkIfUserSuspended)
      throw new ForbiddenException(
        'Your account has been suspended. Please contact the administrator.',
      );
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
