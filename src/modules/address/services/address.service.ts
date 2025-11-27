import { Address } from '../models/Address.model';
import { User } from '../../users/models/User.model';
import { AppError } from '../../../middleware/errorHandler';
import mongoose from 'mongoose';

export interface CreateAddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export class AddressService {
  async addAddress(userId: string, data: CreateAddressData) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await Address.updateMany(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      userId: new mongoose.Types.ObjectId(userId),
      ...data,
    });

    // Add address to user's addresses array
    await User.findByIdAndUpdate(userId, {
      $push: { addresses: address._id },
    });

    return address;
  }

  async listAddresses(userId: string) {
    return await Address.find({ userId: new mongoose.Types.ObjectId(userId) });
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressData) {
    const address = await Address.findOne({
      _id: addressId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!address) {
      throw new AppError('Address not found');
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await Address.updateMany(
        { userId: new mongoose.Types.ObjectId(userId), _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, data);
    await address.save();

    return address;
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await Address.findOneAndDelete({
      _id: addressId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!address) {
      throw new AppError('Address not found');
    }

    // Remove address from user's addresses array
    await User.findByIdAndUpdate(userId, {
      $pull: { addresses: addressId },
    });

    return { message: 'Address deleted successfully' };
  }
}

