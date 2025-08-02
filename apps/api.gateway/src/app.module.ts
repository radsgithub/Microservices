import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SwaggerAggregatorService } from './swagger-aggregator.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        HttpModule, // to make HTTP requests to other microservices
        ConfigModule.forRoot({
            isGlobal: true, // makes env vars available globally
            envFilePath: ['../../.env'],
        }),
    ],
    providers: [SwaggerAggregatorService],
    exports: [SwaggerAggregatorService],
})
export class AppModule { }
