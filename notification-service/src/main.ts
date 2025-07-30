import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'notification-service',
                brokers: ['kafka:9092'], // Use 'kafka' instead of localhost (Docker service name)
            },
            consumer: {
                groupId: 'notification-consumer', // Each service should have a unique groupId
            },
        },
    });

    await app.listen();
    console.log('🚀 Notification service is listening for Kafka messages...');
}
bootstrap();
