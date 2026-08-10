import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export interface UserProfile {
    id: string;
    email: string | null;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
}
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<UserProfile>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile>;
    private findActiveUser;
    private assertEmailAvailable;
    private assertPhoneAvailable;
    private toProfile;
}
