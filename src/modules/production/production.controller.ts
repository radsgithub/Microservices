import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
    constructor(private readonly productionService: ProductionService) { }

    // NOTE: 'batches/pending' is declared before 'batches/:id/...' routes; and
    // GET 'batches' is distinct from GET 'batches/pending'.
    @Get('batches/pending')
    async getPending(@Req() req: any) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.getPendingBatches();
    }

    @Get('batches')
    async getAll(@Req() req: any) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.getAllBatches();
    }

    @Post('optimize')
    async optimize(@Req() req: any, @Body() body: { orderIds?: string[] }) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.optimize(body?.orderIds);
    }

    @Post('batches/:id/start')
    async start(@Req() req: any, @Param('id') id: string) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.startBatch(id);
    }

    @Post('batches/:id/complete')
    async complete(@Req() req: any, @Param('id') id: string, @Body() body: { actualWaste?: number }) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.completeBatch(id, body?.actualWaste);
    }

    @Get('fabric-inventory')
    async getFabric(@Req() req: any) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.getFabricInventory();
    }

    @Post('fabric-inventory')
    async upsertFabric(@Req() req: any, @Body() body: any) {
        await this.productionService.assertAdmin(req.userId);
        return this.productionService.upsertFabric(body);
    }
}
