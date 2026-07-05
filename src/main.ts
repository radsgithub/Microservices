import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/interceptors/http-exception.filter';

async function bootstrap() {
    // rawBody:true keeps the raw request buffer (req.rawBody) so webhook
    // signature verification (Stripe/Printify) can validate the exact bytes.
    const app = await NestFactory.create(AppModule, { rawBody: true });
    app.enableCors();

    // Validation for all incoming DTOs (the microservices defined these DTOs
    // but never wired a global pipe; the monolith enables it centrally).
    app.useGlobalPipes(
        new ValidationPipe({ transform: true, whitelist: true }),
    );

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    // Single, unified Swagger doc for every module (replaces the per-service
    // docs + the api-gateway aggregator).
    const config = new DocumentBuilder()
        .setTitle('E-commerce Monolith API')
        .setDescription('Unified API (auth, users, products, orders, cart)')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
        customSiteTitle: 'E-commerce Monolith API Docs',
    });

    const port = process.env.PORT || 8002;
    await app.listen(port);
    console.log(`Monolith running on http://localhost:${port}`);
    console.log(`API docs at  http://localhost:${port}/api-docs`);
}
bootstrap();
