import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { LogoutService } from './logout.service';
import { responseHandler } from 'src/Until/responseUtil';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/decorator/Role.decorator';
import { logoutDTO } from 'src/dto/userDTO/user.logout.dto';

@Controller('logout')
@ApiTags('Logout')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  @Post(':user_id')
  @Roles('user', 'admin')
  async logout(
    @Param('user_id') user_id: string,
    @Body() logoutDTO: logoutDTO,
  ) {
    try {
      const check = await this.logoutService.logout(user_id, logoutDTO);
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
