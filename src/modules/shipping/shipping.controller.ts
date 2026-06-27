import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { GetRateDto } from './dtos/get-rate.dto';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Post('get-rate')
    getRate(@Body() body: GetRateDto) {
        return this.shippingService.getRate(body);
    }

    @Post('book')
    book(@Body() body: any) {
        return this.shippingService.bookShipment(body);
    }

    @Get('track/:trackingNumber')
    track(@Param('trackingNumber') trackingNumber: string) {
        return this.shippingService.trackShipment(trackingNumber);
    }
}
