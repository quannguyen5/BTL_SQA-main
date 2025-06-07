import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsPhoneNumber, Length} from "class-validator";
import {Expose} from "class-transformer";

export class UserSearchDto {
    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    lastName?: string;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    phone?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @Expose()
    email?: string;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    isActive?: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    role?: string;
}