import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.dto';
// import { UserById } from './interfaces/user.interface';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @GrpcMethod('UserService', 'CreateUser')
    async createUser(data: CreateUserDto) {
        return this.userService.create(data);
    }

    @GrpcMethod('UserService', 'FindOne')
    async findOne(data: any) {
        return this.userService.findById(data.id);
    }

    @GrpcMethod('UserService', 'FindUser')
    findUser(data: { email: string }): Promise<any> {
        return this.userService.findUser({ email: data.email })
    }

}
