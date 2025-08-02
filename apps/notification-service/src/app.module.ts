// src/app.module.ts
import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka/kafka.consumer';

@Module({
    providers: [KafkaConsumerService],
})
export class AppModule { }
