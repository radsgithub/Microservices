import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

// Minimal JWT guard. Verifies the Bearer token issued by AuthService and
// attaches the user id to the request as `req.userId`.
@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const header: string | undefined = request.headers?.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = header.slice(7);
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as {
                sub: string;
            };
            request.userId = payload.sub;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
