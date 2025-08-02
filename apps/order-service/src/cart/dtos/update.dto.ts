import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create.dto';

export class UpdateCartDto extends PartialType(CreateCartDto) { }
