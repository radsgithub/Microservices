"use strict";
// import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as bcrypt from 'bcrypt';
// import * as jwt from "jsonwebtoken"
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';
// import { User, UserDocument } from './schemas/user.schema';
// import { KafkaProducerService } from '../kafka/kafka.producer'; // path may vary
// import { ClientGrpc } from '@nestjs/microservices';
// import { lastValueFrom, Observable } from 'rxjs';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// interface UserServiceClient {
//     CreateUser(data: any): Observable<any>;
//     FindUser(data: any): Observable<any>;
// }
// @Injectable()
// export class AuthService {
//     private userServiceClient!: UserServiceClient;
//     constructor(
//         @InjectModel(User.name) private userModel: Model<UserDocument>,
//         private readonly kafkaProducer: KafkaProducerService,
//         @Inject('USER_SERVICE') private client: ClientGrpc
//     ) { }
//     onModuleInit() {
//         this.userServiceClient = this.client.getService<UserServiceClient>('UserService');
//     }
//     async register(dto: RegisterDto) {
//         const existing = await this.userModel.findOne({ email: dto.email });
//         if (existing) throw new ConflictException('User already exists');
//         // const hashedPassword = await bcrypt.hash(dto.password || "", 10);
//         const createdUser = await lastValueFrom(this.userServiceClient.CreateUser(dto));
//         return { message: 'User registered successfully' };
//     }
//     async login(dto: LoginDto) {
//         const user = await this.userModel.findOne({ email: dto.email })
//         if (!user) throw new UnauthorizedException('Invalid credentials');
//         const isMatch = await bcrypt.compare(dto.password || "", user.password || "");
//         if (!isMatch) throw new UnauthorizedException('Invalid credentials');
//         const token = jwt.sign({ sub: user._id }, 'secret123', { expiresIn: '1d' });
//         await this.kafkaProducer.emit('user-login', {
//             email: user.email,
//             timestamp: new Date().toISOString(),
//             event: 'UserLoggedIn',
//         });
//         return { token };
//     }
//     async validateUser(email: string) {
//         console.log(Object.keys(this.userServiceClient), "chdeck "); // DEBUG
//         const user = await lastValueFrom(this.userServiceClient.FindUser({ email }));
//         return user;
//     }
// }
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const kafka_producer_1 = require("../kafka/kafka.producer");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService {
    constructor(kafkaProducer, client) {
        this.kafkaProducer = kafkaProducer;
        this.client = client;
    }
    onModuleInit() {
        this.userServiceClient = this.client.getService('UserService');
    }
    async register(dto) {
        // Check if user already exists via gRPC
        let existingUser;
        try {
            existingUser = await (0, rxjs_1.lastValueFrom)(this.userServiceClient.FindUser({ email: dto.email }));
        }
        catch (err) {
            existingUser = null;
        }
        if (existingUser && existingUser.id) {
            throw new common_1.ConflictException('User already exists');
        }
        // Create user using gRPC
        const createdUser = await (0, rxjs_1.lastValueFrom)(this.userServiceClient.CreateUser(dto));
        return { message: 'User registered successfully' };
    }
    async login(dto) {
        console.log("here coness");
        // Fetch user from gRPC
        const user = await (0, rxjs_1.lastValueFrom)(this.userServiceClient.FindUser({ email: dto.email }));
        console.log(user, dto.password, user.password, "passwordddd");
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        console.log(dto.password, user.password, "passwordddd");
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = jwt.sign({ sub: user.id }, 'secret123', { expiresIn: '1d' });
        await this.kafkaProducer.emit('user-login', {
            email: user.email,
            timestamp: new Date().toISOString(),
            event: 'UserLoggedIn',
        });
        return { token };
    }
    async validateUser(email) {
        const user = await (0, rxjs_1.lastValueFrom)(this.userServiceClient.FindUser({ email }));
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [kafka_producer_1.KafkaProducerService, Object])
], AuthService);
