import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwaggerAggregatorService implements OnModuleInit {
    public swaggerDocs: any = [];

    async onModuleInit() {
        const services = [
            { name: 'User Service', url: `${process.env.USER_SERVICE}/users-api-json` },
            { name: 'Auth Service', url: `${process.env.AUTH_SERVICE}/auth-api-json` },
            { name: 'Product Service', url: `${process.env.PRODUCT_SERVICE}/products-api-json` },
            { name: 'Order Service', url: `${process.env.ORDER_SERVICE}/orders-api-json` }
        ];

        for (const service of services) {
            try {
                const { data } = await axios.get(service.url);
                // console.log(service, data, "datattata")
                this.swaggerDocs.push({ ...data, info: { ...data.info, title: service.name } });
                console.log(this.swaggerDocs, "swagger")
            } catch (err) {
                console.error(`Failed to fetch Swagger for ${service.name}`, err?.message);
            }
        }
    }

}
