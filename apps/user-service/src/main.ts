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

    // gRPC microservice
    const grpcApp = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: 'user',
            protoPath: join(__dirname, 'proto/user.proto'),
            url: '0.0.0.0:50051',
        },
    });
    const config = new DocumentBuilder()
        .setTitle('User Service API')
        .setDescription('API documentation for User microservice')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    console.log("swagger here........")
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs/user-service', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Auth Service API Docs',
    });
    app.use('/users-api-json', (req: any, res: any) => res.json(document)); // JSON

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.startAllMicroservices();
    await app.listen(3001); // REST API on port 3000
}
bootstrap();
