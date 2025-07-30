"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log("process.env.ENABLE_KAFKA ", process.env.ENABLE_KAFKA);
    if (process.env.ENABLE_KAFKA === 'true') {
        app.connectMicroservice({
            transport: microservices_1.Transport.KAFKA,
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('API documentation for Auth microservice')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    console.log("swagger here........");
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Auth Service API Docs',
    });
    console.log("swagger created", document, "createddd");
    await app.startAllMicroservices();
    await app.listen(3000);
}
bootstrap();
