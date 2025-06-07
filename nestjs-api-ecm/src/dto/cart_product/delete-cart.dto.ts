import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsNotEmpty, IsString} from "class-validator";
import {Expose} from "class-transformer";

export class DeleteCartDto {

    @ApiProperty({
        type: [String],
        description: 'Danh sách cart_ids cần xóa'
    })
    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true })
    @Expose()
    cart_ids: string[];
}