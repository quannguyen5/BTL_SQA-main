import { DeepPartial, Repository } from 'typeorm';

export class BaseService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(
    limit: number = 10,
    page: number = 1,
  ): Promise<{ data: T[]; total: number }> {
    const [result, total] = await this.repository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: result,
      total,
    };
  }

  async create(data: DeepPartial<T>, findCondition: any): Promise<T> {
    const existingRecord = await this.repository.findOne({
      where: findCondition,
    });
    if (existingRecord) {
      throw new Error('RECORD ALREADY EXISTS!');
    }
    const newRecord = this.repository.create(data);
    return await this.repository.save(newRecord);
  }

  async findOne(id: string): Promise<T> {
    const existingRecord = await this.repository.findOneBy({ id } as any);
    if (!existingRecord) {
      throw new Error('RECORD NOT FOUND!');
    } else return existingRecord;
  }

  async update(data: Partial<T>, id: string): Promise<T> {
    const existingRecord = await this.findOne(id);
    Object.assign(existingRecord, data);
    return await this.repository.save(existingRecord);
  }

  async delete(id: string): Promise<void> {
    const existingRecord = await this.findOne(id);
    await this.repository.delete(id);
  }
}
