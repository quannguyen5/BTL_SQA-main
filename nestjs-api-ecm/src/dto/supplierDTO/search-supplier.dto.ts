import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsPhoneNumber} from "class-validator";
import {Expose} from "class-transformer";

export class SearchSupplierDto {
    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    name?: string;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    @IsPhoneNumber('VN')
    phone?: string;

}