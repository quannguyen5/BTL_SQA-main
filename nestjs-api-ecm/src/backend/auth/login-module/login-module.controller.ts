import { Controller, Post, Body } from '@nestjs/common';
import { LoginDTO } from 'src/dto/loginDTO/login.dto';
import { responseHandler } from 'src/Until/responseUtil';
import { ApiTags } from '@nestjs/swagger';
import { LoginModuleService } from 'src/backend/auth/login-module/login-module.service';

@Controller('login')
@ApiTags('Login')
export class LoginModuleController {
  constructor(private readonly loginModuleService: LoginModuleService) {}

  @Post()
  async login(@Body() login: LoginDTO) {
    try {
      const data = await this.loginModuleService.login(login);
      return responseHandler.ok(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
