import { ConsoleLogger, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ImportEntity } from 'src/entities/import_entity/import.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import {GenerateEntityCode} from "src/share/GenerateEntityCode";

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportEntity)
    private readonly importRepo: Repository<ImportEntity>,
    @InjectRepository(Import_productEntity)
    private readonly importProductRepo: Repository<Import_productEntity>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createImportDto: CreateImportDTO) {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const importProduct = this.importRepo.create({
        employee_id: createImportDto.user_id,
        total_amount: createImportDto.totalAmount,
        import_code: GenerateEntityCode.generateOrderCode("IP")
      });

      const importData = await queryRunner.manager.save(importProduct);

      const import_products = createImportDto.products.map((item) => {
        return this.importProductRepo.create({
          quantity: item.quantity,
          price_in: item.price_in,
          product_id: item.product_id,
          import_id: importData.id,
        });
      });

      await queryRunner.manager.save(import_products);

      // Commit transaction
      await queryRunner.commitTransaction();

      return importData;
    } catch (e) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number, limit: number) {
    const [productImports, totalImport] = await this.importRepo.findAndCount({
      relations: ['importProducts'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      list: productImports,
      total: totalImport,
    };
  }

  async getImportCodeMax(){
    const maxCode = await this.importRepo
        .createQueryBuilder('import')
        .select('MAX(import.import_code)', 'max')
        .getRawOne();

    let newCode = 'IPC00001';
    if (maxCode.max) {
      const currentNumber = parseInt(maxCode.max.slice(3), 10); // Lấy phần số của import_code
      const nextNumber = currentNumber + 1;
      newCode = `IPC${String(nextNumber).padStart(5, '0')}`; // Tạo mã mới với định dạng IPC00001
    }
    return {
      import_code: newCode
    };
  }


  async findOne(importProd_id: string) {
    const importProd = await this.importRepo.findOne({
      where: { id: importProd_id },
      relations: ['importProducts'],
    });

    if (!importProd) {
      throw new Error('IMPORT.IMPORT DETAIL NOT EXISTS!');
    }
    return importProd;
  }

  async update(updateImportDto: UpdateImpotyDTO) {
    const importProd = await this.importRepo.findOne({
      where: { id: updateImportDto.import_id },
      relations: ['importProducts'],
    });

    if (!importProd) {
      throw new Error('IMPORT.ORDER UPDATE NOT FOUND!');
    }

    importProd.total_amount = updateImportDto.totalAmount;
    importProd.employee_id = updateImportDto.user_id;
    importProd.import_code = updateImportDto.import_code;

    // Cập nhật danh sách sản phẩm trong Import_productEntity
    for (const ProductDTO of updateImportDto.products) {
      const product = importProd.importProducts.find(
        (prod) => prod.product_id === ProductDTO.product_id,
      );

      if (product) {
        // Nếu sản phẩm đã tồn tại, cập nhật thông tin
        product.quantity = ProductDTO.quantity;
        product.price_in = ProductDTO.price_in;
        console.log(ProductDTO.price_in);
      } else {
        // Nếu sản phẩm không tồn tại, thêm mới
        const newProduct = new Import_productEntity();
        newProduct.product_id = ProductDTO.product_id;
        newProduct.quantity = ProductDTO.quantity;
        newProduct.price_in = ProductDTO.price_in;
        newProduct.import = importProd; // Gán liên kết với order

        importProd.importProducts.push(newProduct); // Thêm vào danh sách sản phẩm
      }
    }

    // Lưu thay đổi vào cơ sở dữ liệu
    const rs = await this.importRepo.save(importProd);
    return rs;
  }

  async delete(id: string) {
    return await this.importRepo.delete(id);
  }
}
