"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KafkaProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
const config_1 = require("@nestjs/config");
let KafkaProducerService = KafkaProducerService_1 = class KafkaProducerService {
    constructor(configService) {
        this.configService = configService;
        this.kafka = new kafkajs_1.Kafka({
            brokers: ['kafka:9092'],
        });
        this.logger = new common_1.Logger(KafkaProducerService_1.name);
        this.enableKafka = this.configService.get('ENABLE_KAFKA') === 'true';
    }
    async onModuleInit() {
        console.log("this.configService.get('ENABLE_KAFKA')", this.configService.get('ENABLE_KAFKA'));
        if (!this.enableKafka) {
            this.logger.log('Kafka is disabled. Skipping Kafka producer init.');
            return;
        }
        this.producer = this.kafka.producer();
        await this.producer.connect();
    }
    async emit(topic, payload) {
        if (!this.enableKafka) {
            this.logger.warn(`Kafka is disabled. Skipping emit to topic: ${topic}`);
            return;
        }
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(payload) }],
        });
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = KafkaProducerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KafkaProducerService);
