import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: JwtPayload): Promise<import("./users.service").UserProfile>;
    updateMe(user: JwtPayload, dto: UpdateProfileDto): Promise<import("./users.service").UserProfile>;
}
