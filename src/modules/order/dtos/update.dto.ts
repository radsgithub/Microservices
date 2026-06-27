import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateOrderDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    status!: string;
}
