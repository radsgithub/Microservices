import { User } from '../models/User.model';
import { AppError } from '../../../middleware/errorHandler';
import { AuthRequest } from '../../../middleware/auth';

export interface UpdateUserData {
  name?: string;
  phone?: string;
}

export class UserService {
  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateUserData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw new AppError('User not found');
    }

    return user;
  }
}

