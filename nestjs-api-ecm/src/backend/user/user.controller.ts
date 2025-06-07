import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/backend/user/user.service';
import { CreateUserDto } from 'src/dto/userDTO/user.create.dto';
import { responseHandler } from 'src/Until/responseUtil';
import { UpdateUserDto } from 'src/dto/userDTO/user.update.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/Role.decorator';
import { ParseBooleanPipe } from 'src/share/ParseBooleanPipe';
import { UserSearchDto } from 'src/dto/userDTO/user.search.dto';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

@Controller('users')
@ApiBearerAuth()
@ApiTags('User')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get(':page/:limit')
  @ApiOperation({
    summary: 'get all user',
    description: 'get all user by admin',
  })
  @Roles('admin')
  async findAll(@Param('page') page: number, @Param('limit') limit: number) {
    try {
      const users = await this.usersService.findAll(page, limit);
      return responseHandler.ok(users);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post('search/:page/:limit')
  @Roles('admin')
  @ApiBody({ type: UserSearchDto, required: false })
  async findAllBySearch(
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Body() userSearchDto?: UserSearchDto,
  ) {
    try {
      const filters: any = {};
      if (userSearchDto?.lastName != null)
        filters.lastName = userSearchDto.lastName;
      if (userSearchDto?.phone != null) filters.phone = userSearchDto.phone;
      if (userSearchDto?.email != null) filters.email = userSearchDto.email;
      if (userSearchDto?.role != null) filters.role = userSearchDto.role;
      if (userSearchDto?.isActive != null)
        filters.isActive = userSearchDto.isActive;
      const users = await this.usersService.findAllBySearch(
        page,
        limit,
        filters,
      );
      return responseHandler.ok(users);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      console.log('user', user);
      return responseHandler.ok(user);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  //get info user for user
  @Get(':user_id')
  @ApiOperation({
    summary: 'get info user for user',
    description: 'get info user for user',
  })
  @Roles('user', 'admin')
  async findOne(@Param('user_id') user_id: string) {
    try {
      const user = await this.usersService.findOne(user_id);
      return responseHandler.ok(user);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  //get info user for admin
  @Get('admin/:user_id')
  @ApiOperation({
    summary: 'get info user by admin',
    description: 'get info user by admin',
  })
  @Roles('admin')
  async findOneByAdmin(@Param('user_id_get') user_id_get: string) {
    try {
      const user = await this.usersService.findOne(user_id_get);
      return responseHandler.ok(user);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch(':user_id')
  @ApiOperation({
    summary: 'update info by user',
    description: 'update info by user',
  })
  @Roles('user')
  async update(
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.usersService.update(user_id, updateUserDto);
      return responseHandler.ok(user);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch(':user_id/:user_id_user')
  @ApiOperation({
    summary: 'update info user by admin',
    description: 'update info user by admin',
  })
  @Roles('admin')
  async updateByAdmin(
    @Param('user_id_user') user_id_user: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.usersService.update(user_id_user, updateUserDto);
      return responseHandler.ok(user);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Delete(':user_id/:user_id_user')
  @Roles('admin')
  async remove(@Param('user_id_user') user_id_user: string) {
    try {
      const check = await this.usersService.remove(user_id_user);
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
