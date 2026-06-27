import { Body, Controller, Get, Param, Put, Post, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.dto';
import { AddAddressDto, UpdateAddressDto } from './dto/address.dto';
import { ApiTags } from '@nestjs/swagger';

// NOTE: In the microservice this controller used `@Controller()` (root path)
// because user-service ran on its own port, and it exposed gRPC methods
// (CreateUser/FindOne/FindUser) for other services. In the monolith those
// gRPC handlers are gone (callers inject UserService directly), and the REST
// routes are namespaced under `/users` to avoid collisions with other modules.
@ApiTags("Users")
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

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
