import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateOrderDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    status!: string;


}
