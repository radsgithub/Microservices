import { PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) { }
