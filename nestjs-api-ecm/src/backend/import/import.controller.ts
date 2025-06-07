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
import { ImportService } from './import.service';
import { responseHandler } from 'src/Until/responseUtil';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/decorator/Role.decorator';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';

@Controller('import')
@ApiTags('import')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createImportDto: CreateImportDTO) {
    try {
      console.log(createImportDto);
      const import_Product = await this.importService.create(createImportDto);
      return responseHandler.ok(import_Product);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get('max-code')
  @Roles('user')
  async getImportCodeMax() {
    try {
      const result = await this.importService.getImportCodeMax();
      return responseHandler.ok(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get(':page/:limit')
  @Roles('admin')
  async findAll(@Param('page') page: number, @Param('limit') limit: number) {
    try {
      const result = await this.importService.findAll(page, limit);
      return responseHandler.ok(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') import_id: string) {
    try {
      const resultDetail = await this.importService.findOne(import_id);
      return responseHandler.ok(resultDetail);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch()
  @Roles('admin')
  async update(@Body() updateImportDto: UpdateImpotyDTO) {
    try {
      const resultUpdate = await this.importService.update(updateImportDto);
      return responseHandler.ok(resultUpdate);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    try {
      const check = await this.importService.delete(id);
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
