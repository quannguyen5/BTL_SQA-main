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
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/Role.decorator';
import { SupplierService } from 'src/backend/supplier/supplier.service';
import { CreateSupplierDto } from 'src/dto/supplierDTO/create-supplier.dto';
import { UpdateSupplierDto } from 'src/dto/supplierDTO/update-supplier.dto';
import { SearchSupplierDto } from 'src/dto/supplierDTO/search-supplier.dto';

@Controller('supplier')
@ApiTags('Supplier')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get(':page/:limit')
  @Roles('admin')
  async getList(@Param('page') page: number, @Param('limit') limit: number) {
    try {
      const filters: any = {};
      const listcategory = await this.supplierService.getList(
        page,
        limit,
        filters,
      );
      return responseHandler.ok(listcategory);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post('search/:page/:limit')
  @Roles('admin')
  async getAllBySearch(
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Body() searchSupplierDto?: SearchSupplierDto,
  ) {
    try {
      const filters: any = {};
      if (searchSupplierDto?.name != null)
        filters.name = searchSupplierDto.name;
      if (searchSupplierDto?.phone != null)
        filters.phone = searchSupplierDto.phone;
      const listcategory = await this.supplierService.getList(
        page,
        limit,
        filters,
      );
      return responseHandler.ok(listcategory);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post()
  @Roles('admin')
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    try {
      const supplierAdd = await this.supplierService.create(createSupplierDto);
      return responseHandler.ok(supplierAdd);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    try {
      const supplierGetById = await this.supplierService.findOne(id);
      return responseHandler.ok(supplierGetById);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    try {
      const updateSupplier = await this.supplierService.update(
        updateSupplierDto,
        id,
      );
      return responseHandler.ok(updateSupplier);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    try {
      const deleteSupplier = await this.supplierService.delete(id);
      return responseHandler.ok(deleteSupplier);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
