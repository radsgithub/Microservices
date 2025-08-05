


import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "@common/interceptors/http-exception.filter";
import { ResponseInterceptor } from "@common/interceptors/response.interceptor";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors(); // if needed


    const config = new DocumentBuilder()
        .setTitle('Orders Service API')
        .setDescription('API documentation for Orders microservice')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs/order-service', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Orders Service API Docs',
    });
    app.use('/orders-api-json', (req: any, res: any) => res.json(document)); // JSON
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.startAllMicroservices();
    await app.listen(3003); // REST API on port 3000
}
bootstrap();
