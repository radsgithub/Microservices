
import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { KafkaProducerService } from '../kafka/kafka.producer';

// ClientGrpc: Interface provided by NestJS to communicate with a gRPC server.

// lastValueFrom: Converts RxJS Observable to Promise.

// Observable: Return type of gRPC service methods.

import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';





// Describes the shape of the gRPC service client.

// These methods map to the service defined in the .proto file: e.g., rpc CreateUser(...) and rpc FindUser(...).

interface UserServiceClient {
    CreateUser(data: any): Observable<any>;
    FindUser(data: any): Observable<any>;
}


@Injectable()
export class AuthService {
    private userServiceClient!: UserServiceClient;

    // Injects the gRPC client with token 'USER_SERVICE' (configured in the module via provide: 'USER_SERVICE').

    constructor(
        private readonly kafkaProducer: KafkaProducerService,
        @Inject('USER_SERVICE') private client: ClientGrpc,
    ) { }


    //     Called automatically when the service is initialized.

    // Gets the actual gRPC service implementation from client for UserService (must match service name in .proto).

    onModuleInit() {
        this.userServiceClient = this.client.getService<UserServiceClient>('UserService');
    }

    async register(dto: RegisterDto) {
        // Check if user already exists via gRPC
        let existingUser;
        try {
            // lastValueFrom(...) waits for the Observable to emit its result (from the gRPC call).


            existingUser = await lastValueFrom(this.userServiceClient.FindUser({ email: dto.email }));
        } catch (err) {
            existingUser = null;
        }

        if (existingUser && existingUser.id) {
            throw new ConflictException('User already exists');
        }

        // Create user using gRPC
        const createdUser = await lastValueFrom(this.userServiceClient.CreateUser(dto));

        return { message: 'User registered successfully' };
    }

    async login(dto: LoginDto) {
        console.log("here coness")
        // Fetch user from gRPC
        const user = await lastValueFrom(this.userServiceClient.FindUser({ email: dto.email }));
        console.log(user, dto.password, user.password, "passwordddd")

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        console.log(dto.password, user.password, "passwordddd")
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = jwt.sign({ sub: user.id }, 'secret123', { expiresIn: '1d' });

        await this.kafkaProducer.emit('user-login', {
            email: user.email,
            timestamp: new Date().toISOString(),
            event: 'UserLoggedIn',
        });

        return { token };
    }

    async validateUser(email: string) {
        const user = await lastValueFrom(this.userServiceClient.FindUser({ email }));
        return user;
    }
}
