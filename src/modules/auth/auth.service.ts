import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { getJwtSecret } from '../../common/config/env';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
    ) { }

    private signToken(userId: string): string {
        return jwt.sign({ sub: userId }, getJwtSecret(), {
            expiresIn: '1d',
        });
    }

    private publicUser(user: any) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async register(dto: RegisterDto) {
        let existingUser: any = null;
        try {
            existingUser = await this.userService.findUser({ email: dto.email });
        } catch (err) {
            existingUser = null; // findUser throws NotFoundException when absent
        }

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const created: any = await this.userService.create(dto as any);

        // Frontend expects a token + user immediately after registration.
        const token = this.signToken(created._id);
        return { token, user: this.publicUser(created) };
    }

    async login(dto: LoginDto) {
        let user: any;
        try {
            user = await this.userService.findUser({ email: dto.email });
        } catch (err) {
            throw new UnauthorizedException('Incorrect username or password');
        }

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Incorrect username or password');
        }

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Incorrect username or password');
        }

        const token = this.signToken(user._id);

        this.notificationService.handleUserLogin({
            email: user.email,
            timestamp: new Date().toISOString(),
            event: 'UserLoggedIn',
        });

        return { token, user: this.publicUser(user) };
    }

    async validateUser(email: string) {
        return this.userService.findUser({ email });
    }
}
