import { Module } from '@nestjs/common';
import { LocationUserService } from './location_user.service';
import { LocationUserController } from './location_user.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import {Location_userEntity} from "src/entities/user_entity/location_user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Location_userEntity])],
  exports: [LocationUserService],
  controllers: [LocationUserController],
  providers: [LocationUserService],
})
export class LocationUserModule {

}
