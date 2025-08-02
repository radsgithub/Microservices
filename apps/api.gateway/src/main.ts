import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerAggregatorService } from './swagger-aggregator.service';
import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { Request, Response } from 'express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const aggregator = app.get(SwaggerAggregatorService);

    // Wait for swaggerDocs to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Serve individual Swagger UIs for each service
    aggregator.swaggerDocs.forEach((doc) => {
        const name = doc.info.title.toLowerCase().replace(/ /g, '-');
        app.use(`/api-docs/${name}`, swaggerUi.serve, swaggerUi.setup(doc));
    });

    app.use('/api-docs', (req: Request, res: Response) => {
        const services = [
            { name: 'auth-service', url: `${process.env.AUTH_SERVICE}/api-docs/auth-service` },
            { name: 'user-service', url: `${process.env.USER_SERVICE}/api-docs/user-service` },
            { name: 'product-service', url: `${process.env.PRODUCT_SERVICE}/api-docs/product-service` },
            { name: 'order-service', url: `${process.env.ORDER_SERVICE}/api-docs/order-service` }


        ];
        const links = services
            .map(service => `<li><a href="${service.url}" target="_blank">${service.name}</a></li>`)
            .join('');

        res.send(`
            <html>
                <head><title>API Docs</title></head>
                <body>
                    <h1>API Documentation</h1>
                    <ul>${links}</ul>
                </body>
            </html>
        `);
    });


    await app.listen(8000, () => {
        console.log('API Docs available at:');
        console.log('→ http://localhost:8000/api-docs');
    });
}
bootstrap();
