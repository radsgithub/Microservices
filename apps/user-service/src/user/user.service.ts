import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create.dto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update.dto';
import { AddAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password || "", 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword, // Replace plain password with hashed one
        });
        return createdUser.save();
    }

    async findById(_id: string): Promise<User | null> {
        return this.userModel.findById(_id, "-password").exec();
    }

    async findUser(data: any): Promise<any> {
        const user = await this.userModel.findOne({ email: data.email });
        console.log("user", user, { where: { email: data.email } })
        if (!user) {
            console.log("user", user, { where: { email: data.email } })

            throw new RpcException({
                code: status.NOT_FOUND,
                message: 'User not found',
            });
        }

        return user
    }

    async update(id: string, updateData: UpdateUserDto) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await user.updateOne(updateData);
        return user;
    }

    async addAddress(userId: string, addressData: AddAddressDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.addresses.push(addressData);
        await user.save();
        return user;
    }

    async updateAddress(userId: string, addressData: UpdateAddressDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (addressData.addressIndex < 0 || addressData.addressIndex >= user.addresses.length) {
            throw new NotFoundException('Address index out of bounds');
        }

        const { addressIndex, ...addressFields } = addressData;
        user.addresses[addressIndex] = addressFields;
        await user.save();
        return user;
    }

    async getAddresses(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.addresses;
    }

    async deleteAddress(userId: string, addressIndex: number) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (addressIndex < 0 || addressIndex >= user.addresses.length) {
            throw new NotFoundException('Address index out of bounds');
        }

        user.addresses.splice(addressIndex, 1);
        await user.save();
        return user;
    }
}
