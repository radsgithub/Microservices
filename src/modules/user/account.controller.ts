import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// Token-authenticated "current user" endpoints that the frontend expects:
//   GET  /user/profile
//   PUT  /user/update
// (The /users/:id routes in UserController remain for id-based access.)
@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class AccountController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    getProfile(@Req() req: any) {
        return this.userService.findById(req.userId);
    }

    @Put('update')
    updateProfile(@Req() req: any, @Body() body: UpdateUserDto) {
        return this.userService.update(req.userId, body);
    }
}
