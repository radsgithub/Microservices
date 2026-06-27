import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dtos/create.dto';
import { UpdateAddressDto } from './dtos/update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Get('list')
    list(@Req() req: any) {
        return this.addressService.list(req.userId);
    }

    @Post('add')
    add(@Req() req: any, @Body() body: CreateAddressDto) {
        return this.addressService.add(req.userId, body);
    }

    @Put('update/:id')
    update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateAddressDto) {
        return this.addressService.update(req.userId, id, body);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.addressService.remove(req.userId, id);
    }
}
