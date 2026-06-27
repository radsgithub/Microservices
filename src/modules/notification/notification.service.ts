import { Injectable, Logger } from '@nestjs/common';

/**
 * In-process replacement for the old Kafka-based notification-service.
 * Where the microservices published a `user-login` event to Kafka and a
 * separate consumer logged it, the monolith simply calls this service
 * directly. Swap the body for real email/push logic as needed.
 */
@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    handleUserLogin(payload: { email: string; timestamp: string; event: string }) {
        this.logger.log(`📨 Notification: ${payload.event} - ${payload.email} at ${payload.timestamp}`);
    }
}
