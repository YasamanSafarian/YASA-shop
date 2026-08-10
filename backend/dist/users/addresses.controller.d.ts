import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
    list(user: JwtPayload): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(user: JwtPayload, dto: CreateAddressDto): Promise<{
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
    update(user: JwtPayload, id: string, dto: UpdateAddressDto): Promise<{
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
    remove(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
