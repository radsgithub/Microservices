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


import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface UserServiceClient {
    CreateUser(data: any): Observable<any>;
    FindUser(data: any): Observable<any>;
}

@Injectable()
export class AuthService {
    private userServiceClient!: UserServiceClient;

    constructor(
        private readonly kafkaProducer: KafkaProducerService,
        @Inject('USER_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.userServiceClient = this.client.getService<UserServiceClient>('UserService');
    }

    async register(dto: RegisterDto) {
        // Check if user already exists via gRPC
        let existingUser;
        try {
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
