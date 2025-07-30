// src/kafka/kafka.consumer.ts
import { OnModuleInit, Injectable } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
    private readonly kafka = new Kafka({
        brokers: ['kafka:9092'],
    });

    private readonly consumer = this.kafka.consumer({ groupId: 'notification-group' });

    async onModuleInit() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'user-login', fromBeginning: false });

        await this.consumer.run({
            eachMessage: async ({ message }: EachMessagePayload) => {
                const data = JSON.parse((message.value || "").toString());
                console.log('📨 Notification received:', data);
                // You can send email, push notification, etc. here
            },
        });
    }
}
