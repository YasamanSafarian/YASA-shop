import { PrismaService } from '../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        province: string;
        city: string;
        address: string;
        user_id: string;
        receiver_name: string;
        receiver_phone: string;
        postal_code: string;
        is_default: boolean;
    }[]>;
    create(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        province: string;
        city: string;
        address: string;
        user_id: string;
        receiver_name: string;
        receiver_phone: string;
        postal_code: string;
        is_default: boolean;
    }>;
    update(userId: string, id: string, dto: UpdateAddressDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        province: string;
        city: string;
        address: string;
        user_id: string;
        receiver_name: string;
        receiver_phone: string;
        postal_code: string;
        is_default: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    private findOwned;
}
