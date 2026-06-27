import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dtos/create.dto';
import { UpdateAddressDto } from './dtos/update.dto';

@Injectable()
export class AddressService {
    constructor(
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    ) { }

    async list(userId: string) {
        return this.addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    }

    // Unscoped lookup (used by admin order fulfillment to read the ship-to address).
    async findById(id: string) {
        return this.addressModel.findById(id);
    }

    async add(userId: string, dto: CreateAddressDto) {
        const count = await this.addressModel.countDocuments({ userId });
        // First address is default; or honor an explicit isDefault flag.
        const isDefault = dto.isDefault ?? count === 0;
        if (isDefault) {
            await this.addressModel.updateMany({ userId }, { $set: { isDefault: false } });
        }
        return this.addressModel.create({ ...dto, userId, isDefault });
    }

    async update(userId: string, id: string, dto: UpdateAddressDto) {
        if (dto.isDefault) {
            await this.addressModel.updateMany({ userId }, { $set: { isDefault: false } });
        }
        const address = await this.addressModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: dto },
            { new: true },
        );
        if (!address) {
            throw new NotFoundException('Address not found');
        }
        return address;
    }

    async remove(userId: string, id: string) {
        const result = await this.addressModel.findOneAndDelete({ _id: id, userId });
        if (!result) {
            throw new NotFoundException('Address not found');
        }
        return { message: 'Address deleted successfully' };
    }
}
