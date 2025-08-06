import { Body, Controller, Get, Param, Put, Post, Delete } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { AddAddressDto, UpdateAddressDto } from './dto/address.dto';
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
        return this.userService.findById(data._id);
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

    // REST: POST /users/:id/addresses
    @Post(':id/addresses')
    async addUserAddress(@Param('id') id: string, @Body() addressData: AddAddressDto) {
        return this.userService.addAddress(id, addressData);
    }

    // REST: PUT /users/:id/addresses/:index
    @Put(':id/addresses/:index')
    async updateUserAddress(
        @Param('id') id: string,
        @Param('index') index: string,
        @Body() addressData: AddAddressDto
    ) {
        const updateData: UpdateAddressDto = {
            ...addressData,
            addressIndex: parseInt(index)
        };
        return this.userService.updateAddress(id, updateData);
    }

    // REST: GET /users/:id/addresses
    @Get(':id/addresses')
    async getUserAddresses(@Param('id') id: string) {
        return this.userService.getAddresses(id);
    }

    // REST: DELETE /users/:id/addresses/:index
    @Delete(':id/addresses/:index')
    async deleteUserAddress(@Param('id') id: string, @Param('index') index: string) {
        return this.userService.deleteAddress(id, parseInt(index));
    }
}
