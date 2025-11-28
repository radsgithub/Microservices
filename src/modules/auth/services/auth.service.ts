import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../../users/models/User.model';
import { config } from '../../../config/env';
import { AppError } from '../../../middleware/errorHandler';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const { name, email, password, phone } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      addresses: [],
      role: 'user',
    });

    // Generate JWT token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: config.jwtExpiresIn } as SignOptions);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password');
    }

    // Generate JWT token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: config.jwtExpiresIn } as SignOptions);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

