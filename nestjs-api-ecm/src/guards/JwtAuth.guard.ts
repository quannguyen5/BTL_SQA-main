import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/backend/user/user.service';
import { responseHandler } from 'src/Until/responseUtil';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private userService: UserService,
    private ConfigService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();

    // get authorization
    const authorizationHeader = request.headers.authorization;
    // check
    if (!authorizationHeader) {
      return responseHandler.error('GUARD.PLEASE PROVIDE AUTHORIZATIONHEADER!');
    }
    // get token
    const token = authorizationHeader.split(' ')[1]; // Tách chuỗi và lấy token sau "Bearer "

    // check
    if (!token) {
      return responseHandler.error('GUARD.PLEASE PROVIDE TOKEN!');
    }

    try {
      // verify token
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.ConfigService.get('JWT_SECRET'),
      });

      if (!payload) {
        return responseHandler.error('GUARD.PAYLOAD OF TOKEN IS NOT EXISTS!');
      }

      const user = await this.userService.findOne(payload.id);

      if (user.isActive === false) return false;

      if (!user.token) return false;
      if (user.role != 'admin') {
        // Lấy user_id từ params
        const paramUserId = request.params.user_id;
        if (paramUserId && paramUserId !== payload.id) {
          return responseHandler.error(
            'GUARD.USER ID IN PARAM DOES NOT MATCH WITH TOKEN!',
          );
        }
      }

      request.user = user;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      throw new UnauthorizedException(errorMessage);
    }
    return true;
  }
}
