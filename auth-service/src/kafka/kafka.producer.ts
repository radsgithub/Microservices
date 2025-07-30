import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
    private readonly kafka = new Kafka({
        brokers: ['kafka:9092'],

    });

    private producer!: Producer;
    private readonly enableKafka: boolean;
    private readonly logger = new Logger(KafkaProducerService.name);
    constructor(private readonly configService: ConfigService) {
        this.enableKafka = this.configService.get('ENABLE_KAFKA') === 'true';
    }
    async onModuleInit() {
        console.log("this.configService.get('ENABLE_KAFKA')", this.configService.get('ENABLE_KAFKA'))
        if (!this.enableKafka) {
            this.logger.log('Kafka is disabled. Skipping Kafka producer init.');
            return;
        }
        this.producer = this.kafka.producer();
        await this.producer.connect();
    }

    async emit(topic: string, payload: any) {
        if (!this.enableKafka) {
            this.logger.warn(`Kafka is disabled. Skipping emit to topic: ${topic}`);
            return;
        }
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(payload) }],
        });
    }
}
