import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from 'src/entities/user_entity/user.entity';
import { CreateUserDto } from 'src/dto/userDTO/user.create.dto';
import { authenticator } from 'otplib';
import { Account } from 'src/Until/configConst';
import { VerifyDto } from 'src/dto/userDTO/user.verify.dto';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { log } from 'console';

@Injectable()
export class RegisterModuleService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Location_userEntity)
    private readonly locationRepository: Repository<Location_userEntity>,
    private readonly dataSource: DataSource,
  ) {
    authenticator.options = { digits: 6, step: 120 };
  }

  private async sendEmail(email: string, token: string) {
    try {
      console.log('send email');
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: Account.USER,
          pass: Account.PASS,
        },
      });
  
      const mailOptions = {
        from: Account.USER,
        to: email,
        subject: 'OTP Register Account',
        text: `Your OTP (It will expire after 2 minutes): ${token}`,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('EMAIL.SEND_FAILED');
    }
  }
  

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser?.isActive) {
      console.log('existingUser', existingUser);
      throw new Error('REGISTER.ACCOUNT EXISTS!');
    }

    if (existingUser && !existingUser.isActive) {
      const otp = authenticator.generate(existingUser.email);
      console.log('OTP1:', otp);
      await this.sendEmail(
        existingUser.email,
        otp
      );
      return { email: existingUser.email };
      // throw new Error('REGISTER.ACCOUNT NOT VERIFY! PLEASE ENTER OTP VERIFY!');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Prepare user data
      const user = this.userRepository.create({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: hashedPassword,
      });

      // Save user and get the ID
      const savedUser = await queryRunner.manager.save(user);

      // Prepare location data
      const location = this.locationRepository.create({
        name: createUserDto.firstName + ' ' + createUserDto.lastName,
        address: createUserDto.address,
        phone: createUserDto.phone,
        default_location: true,
        user_id: savedUser.id,
      });

      // Save location
      await queryRunner.manager.save(location);
      console.log('111');

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('2222');
      // Send OTP email
      const otp = authenticator.generate(savedUser.email);
      console.log('OTP1:', otp);
      await this.sendEmail(
        savedUser.email,
        authenticator.generate(savedUser.email),
      );
      console.log('3333');
      return { email: savedUser.email };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'REGISTER.OCCUR ERROR WHEN SAVE TO DATABASE!',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async update(verifyDto: VerifyDto) {
    const token = verifyDto.otp;
    const secret = verifyDto.email;

    const isVerified = authenticator.check(token, secret);
    if (!isVerified) {
      throw new Error('REGISTER.OTP EXPIRED!');
    }

    const result = await this.userRepository.update(
      { email: secret },
      { isActive: true },
    );

    if (result.affected === 0) {
      throw new Error('REGISTER.UPDATE ACTIVE FAILED!');
    }

    return true;
  }
}
