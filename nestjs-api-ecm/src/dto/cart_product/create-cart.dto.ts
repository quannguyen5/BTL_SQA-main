import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";
import {Expose} from "class-transformer";
import {Column} from "typeorm";

export class CreateCartDto {

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    quantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    product_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    user_id: string;
}
