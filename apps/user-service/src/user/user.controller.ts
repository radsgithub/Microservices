import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { ApiTags } from '@nestjs/swagger';
// import { UserById } from './interfaces/user.interface';

@ApiTags("Users")
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }

    // gRPC method: Create user

    @GrpcMethod('UserService', 'CreateUser')
    async createUser(data: CreateUserDto) {
        return this.userService.create(data);
    }

    // gRPC method: Find one user by id

    @GrpcMethod('UserService', 'FindOne')
    async findOne(data: any) {
        return this.userService.findById(data.id);
    }

    // gRPC method: Find user by email

    @GrpcMethod('UserService', 'FindUser')
    findUser(data: { email: string }): Promise<any> {
        return this.userService.findUser({ email: data.email })
    }

    // REST: GET /users/:id
    @Get(':id')
    async getUserById(@Param('id') id: string) {
        return this.userService.findById(id);
    }

    // REST: PUT /users/:id
    @Put(':id')
    async updateUserById(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
        return this.userService.update(id, updateData);
    }

}
