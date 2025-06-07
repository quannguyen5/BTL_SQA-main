import { Controller, Post, Body, Patch } from '@nestjs/common';
import { RegisterModuleService } from './register-service/register-module.service';
import { CreateUserDto } from 'src/dto/userDTO/user.create.dto';
import { responseHandler } from 'src/Until/responseUtil';
import { VerifyDto } from 'src/dto/userDTO/user.verify.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('register')
@ApiTags('Regiter')
export class RegisterModuleController {
  constructor(private readonly registerModuleService: RegisterModuleService) {}

  @Post()
  async create(@Body() createUserDTO: CreateUserDto) {
    try {
      const email = await this.registerModuleService.create(createUserDTO);
      console.log('Email sent successfully:', email);
      return responseHandler.ok(email);
    } catch (e) {
      console.error('Error sending email:', e);
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch()
  async update(@Body() verifyDTO: VerifyDto) {
    return this.registerModuleService.update(verifyDTO);
  }
}
