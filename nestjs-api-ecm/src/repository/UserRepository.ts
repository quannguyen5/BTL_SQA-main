import {DataSource, EntityRepository, Repository} from "typeorm";
import {User} from "src/entities/user_entity/user.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    constructor(private readonly dataSource: DataSource) {
        super(User, dataSource.manager);
    }
}