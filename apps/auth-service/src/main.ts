import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    console.log("process.env.ENABLE_KAFKA ", process.env.ENABLE_KAFKA)
    if (process.env.ENABLE_KAFKA === 'true') {

        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.KAFKA,
            options: {
                client: {
                    brokers: ['kafka:9092']
                    // we'll use this in Docker later
                },
                consumer: {
                    groupId: 'auth-consumer', // must be unique per service
                },
            },
        });
    }
    const config = new DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('API documentation for Auth microservice')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    console.log("swagger here........")
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs/auth-service', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Auth Service API Docs',
    });
    app.use('/auth-api-json', (req: any, res: any) => res.json(document)); // JSON

    console.log("swagger created", document, "createddd")
    await app.startAllMicroservices();
    await app.listen(3000);
}
bootstrap();