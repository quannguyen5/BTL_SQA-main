import {EntityRepository, Repository} from "typeorm";
import {Location_userEntity} from "src/entities/user_entity/location_user.entity";

@EntityRepository(Location_userEntity)
export class LocationUserRepository extends Repository<Location_userEntity> {

}