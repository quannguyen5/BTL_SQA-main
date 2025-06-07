import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user_entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { changePassDTO } from 'src/dto/userDTO/user.changePass.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async changePassword(user_id: string, changePassDTO: changePassDTO) {
    const user = await this.userRepo.findOneBy({
      id: user_id,
    });

    // check account
    if (!user) {
      throw new NotFoundException('CHANGE-PASS.USER.EMAIL IS NOT VALID!');
    }

    const checkPass = await bcrypt.compare(
      changePassDTO.password,
      user.password,
    );

    if (!checkPass) {
      throw new Error('CHANGE-PASS.USER NOT EXIST!');
    }

    user.password = await bcrypt.hash(changePassDTO.newPassword, 10);

    const check = this.userRepo.save(user);

    if (!check) {
      throw new Error('CHANGE-PASS.CHANGE-PASS ERROR!');
    }

    return check;
  }
}
