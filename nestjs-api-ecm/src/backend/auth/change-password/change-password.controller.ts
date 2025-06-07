import {Body, Controller, Param, Post, UseGuards} from '@nestjs/common';
import { ChangePasswordService } from './change-password.service';
import { changePassDTO } from 'src/dto/userDTO/user.changePass.dto';
import { responseHandler } from 'src/Until/responseUtil';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "src/guards/JwtAuth.guard";
import {RolesGuard} from "src/guards/Roles.guard";
import {Roles} from "src/decorator/Role.decorator";

@Controller('change-password')
@ApiTags('Change-Password')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChangePasswordController {
  constructor(private readonly changePasswordService: ChangePasswordService) {}

  @Post(':user_id')
  @Roles('user', 'admin')
  async changePass(
    @Param('user_id') user_id: string,
    @Body() changePassDTO: changePassDTO,
  ) {
    try {
      const check = await this.changePasswordService.changePassword(
        user_id,
        changePassDTO,
      );
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
