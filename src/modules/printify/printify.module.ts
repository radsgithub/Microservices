import { Module } from '@nestjs/common';
import { PrintifyService } from './printify.service';

@Module({
    providers: [PrintifyService],
    exports: [PrintifyService],
})
export class PrintifyModule { }
