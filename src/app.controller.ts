import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class AppController {
    @Get(['', 'health'])
    @Head(['', 'health'])
    healthCheck() {
        return { status: 'ok', service: 'monolith-backend', timestamp: new Date().toISOString() };
    }
}
