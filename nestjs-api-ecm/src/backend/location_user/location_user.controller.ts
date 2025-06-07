import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/Role.decorator';
import { responseHandler } from 'src/Until/responseUtil';
import { LocationUserService } from 'src/backend/location_user/location_user.service';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';

@Controller('location-user')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('Location-user')
@ApiBearerAuth()
export class LocationUserController {
  constructor(private readonly locationUserService: LocationUserService) {}

  @Get(':user_id')
  @Roles('user')
  async getAllLocation(@Param('user_id') user_id: string) {
    try {
      const filters = {
        user_id: user_id,
      };
      const result = await this.locationUserService.getList(filters);
      return responseHandler.ok(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get(':user_id/:user_id_get')
  @Roles('admin')
  async getAllLocationAdmin(@Param('user_id_get') user_id_get: string) {
    try {
      const filters = {
        user_id: user_id_get,
      };
      const result = await this.locationUserService.getList(filters);
      return responseHandler.ok(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post(':user_id')
  // @Roles('user')
  async create(@Body() createLocationUserDto: CreateLocationUserDto) {
    try {
      const data = await this.locationUserService.createLocation(
        createLocationUserDto,
      );
      return responseHandler.ok(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch(':user_id')
  @Roles('user')
  async update(@Body() updateLocationUserDto: UpdateLocationUserDto) {
    try {
      const check = await this.locationUserService.update(
        updateLocationUserDto,
      );
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Delete(':user_id/:id')
  @Roles('user')
  async remove(@Param('id') id: string) {
    try {
      const check = await this.locationUserService.delete(id);
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
