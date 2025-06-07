import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from 'src/dto/loginDTO/login.dto';
import { User } from 'src/entities/user_entity/user.entity';

@Injectable()
export class LoginModuleService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwt: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDTO: LoginDTO) {
    const user = await this.userRepository.findOneBy({
      email: loginDTO.email,
    });

    // check account
    if (!user) {
      throw new NotFoundException('LOGIN.USER.EMAIL IS NOT VALID!');
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginDTO.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('LOGIN.USER.PASSWORD IS NOT VALID!');
    }

    // generate accessToken
    const accessToken = await this.jwt.signAsync({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    user.token = accessToken;
    await this.userRepository.save(user);

    return {
      user: user,
      accessToken: accessToken,
    };
  }
}
