import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/decorator/Role.decorator';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryCreateDTO } from 'src/dto/categoryDTO/category.create.dto';
import { CategoryService } from 'src/backend/category/category.service';
import { categoryUpdateDTO } from 'src/dto/categoryDTO/category.update.dto';
import { ApplyStatus } from 'src/share/Enum/Enum';

@Controller('category')
@ApiTags('Category')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':page/:limit')
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Tên loại',
  })
  @ApiQuery({
    name: 'status',
    enum: ApplyStatus,
    required: false,
    description: 'Trạng thái áp dụng (All, True, False)',
  })
  async getList(
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Query('name') name?: string,
    @Query('status') status?: ApplyStatus,
  ) {
    try {
      const filters = {
        status: status !== undefined ? status : '',
        name: name !== undefined ? name : '',
      };
      const listcategory = await this.categoryService.getList(
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
  async create(@Body() createCate: CategoryCreateDTO) {
    try {
      const category = await this.categoryService.create(createCate);
      return responseHandler.ok(category);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get(':id')
  @Roles('admin')
  async detail(@Param('id') id: string) {
    try {
      return responseHandler.ok(await this.categoryService.detail(id));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch()
  @Roles('admin')
  async update(@Body() categoryUpdateDTO: categoryUpdateDTO) {
    try {
      const check = await this.categoryService.update(
        categoryUpdateDTO,
        categoryUpdateDTO.id,
      );
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    try {
      const check = await this.categoryService.delete(id);
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
