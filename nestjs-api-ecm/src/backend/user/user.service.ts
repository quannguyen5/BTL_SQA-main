import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user_entity/user.entity';
import { CreateUserDto } from 'src/dto/userDTO/user.create.dto';
import { UpdateUserDto } from 'src/dto/userDTO/user.update.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const userAdd = plainToClass(User, createUserDto);
    const chechExists = await this.usersRepository.findOneBy({
      email: userAdd.email,
    });
    // throw error exsist
    if (chechExists?.isActive) {
      throw new Error('ACCOUNT EXSIST!');
    }

    // hashPassword
    const hashPassword = await bcrypt.hash(userAdd.password, 10);
    userAdd.password = hashPassword;

    // insert into db
    const check = await this.usersRepository.save(userAdd);
    // check action insert
    if (!check) {
      throw new Error('OCCUR ERROR WHEN SAVE USER TO DB!');
    }

    console.log('check', check);
    return {
      id: check.id,
      // email: check.email,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be greater than 0.');
    }

    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!users) throw new Error('NO USER!');

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async findAllBySearch(page: number = 1, limit: number = 10, filters: any) {
    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be greater than 0.');
    }
    const whereConditions: FindOptionsWhere<User> = {
      ...(filters.lastName && { lastName: Like(`%${filters.lastName}%`) }),
      ...(filters.email && { email: Like(`%${filters.email}%`) }),
      ...(filters.phone && { phone: Like(`%${filters.phone}%`) }),
      ...(filters.role && { role: filters.role }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };
    const [users, total] = await this.usersRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!users) throw new Error('NO USER!');

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id: id });

    if (!user) {
      throw new Error('USER WITH ID ${id} NOT FOUND!');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error(`USER WITH ID ${id} NOT FOUND!`);
    }

    Object.assign(user, updateUserDto);

    const check = await this.usersRepository.save(user);

    if (!check) throw new Error('UPDATE NOT SUCCESS!');

    return user;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`USER WITH ID ${id} NOT FOUND`);
    }
    user.isActive = false;
    const check = await this.usersRepository.save(user);
    if (!check) throw new Error('REMOVE NOT SUCCESS!');
    return user;
  }

  async getManageUserDashBoard() {
    try {
      const today = new Date();
      const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay()));

      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);

      const totalUsers = await this.usersRepository.count();
      const usersThisWeek = await this.usersRepository
          .createQueryBuilder('user')
          .where('user.createdAt >= :startOfThisWeek', { startOfThisWeek })
          .getCount();

      const usersLastWeek = await this.usersRepository
          .createQueryBuilder('user')
          .where('user.createdAt >= :startOfLastWeek', { startOfLastWeek })
          .andWhere('user.createdAt <= :endOfLastWeek', { endOfLastWeek })
          .getCount();
      return {
        data: {
          totalUsers,
          usersThisWeek,
          usersLastWeek,
        },
      };
    } catch (error) {
      return {
        error: error.toString(),
      };
    }
  }
}
