import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

export interface AuditEntry {
    action: string;
    message: string;
    level?: 'info' | 'warn' | 'error';
    orderId?: string | Types.ObjectId;
    userId?: string | Types.ObjectId;
    meta?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
    private readonly logger = new Logger('Audit');

    constructor(
        @InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLogDocument>,
    ) { }

    // Writes to both the server log stream and the durable audit collection.
    // Persistence failures are swallowed (and logged) so auditing can never
    // break the actual payment/order flow.
    async log(entry: AuditEntry): Promise<void> {
        const level = entry.level ?? 'info';
        const line = `[${entry.action}] ${entry.message}`;
        if (level === 'error') this.logger.error(line, entry.meta as any);
        else if (level === 'warn') this.logger.warn(line);
        else this.logger.log(line);

        try {
            await this.auditModel.create({
                action: entry.action,
                message: entry.message,
                level,
                orderId: entry.orderId ? new Types.ObjectId(entry.orderId) : undefined,
                userId: entry.userId ? new Types.ObjectId(entry.userId) : undefined,
                meta: entry.meta,
            });
        } catch (err) {
            this.logger.error(`Failed to persist audit log for ${entry.action}`, err as any);
        }
    }
}
