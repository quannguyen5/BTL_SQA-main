import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { responseHandler } from 'src/Until/responseUtil';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Nếu không có roles yêu cầu, cho phép truy cập
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy thông tin user đã được JwtAuthGuard gán vào request

    //Nếu không có quyền truy cập
    if (!user || !roles.includes(user.role)) {
      throw new UnauthorizedException(
        responseHandler.unauthorized('You cannot access!'),
      );
    }
    return roles.includes(user.role); // Kiểm tra role của user với roles yêu cầu
  }
}
