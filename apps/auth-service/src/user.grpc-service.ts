import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';

interface UserServiceGrpc {
    CreateUser(data: any): any;
    FindOne(data: any): any;
}

@Injectable()
export class UserGrpcService implements OnModuleInit {
    private userService!: UserServiceGrpc;

    constructor(@Inject('USER_PACKAGE') private client: ClientGrpc) { }

    onModuleInit() {
        this.userService = this.client.getService<UserServiceGrpc>('UserService');
    }

    createUser(data: any) {
        return this.userService.CreateUser(data);
    }

    findOne(data: any) {
        return this.userService.FindOne(data);
    }

    findUser(data: { email: string }): Promise<any> {
        return this.userService.FindOne({ email: data.email })
    }

}
