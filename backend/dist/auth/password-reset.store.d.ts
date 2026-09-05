interface StoredPasswordReset {
    userId: string;
    tokenHash: string;
    expiresAt: number;
}
export declare class PasswordResetStore {
    private readonly store;
    save(resetId: string, userId: string, tokenHash: string, expiresAt: number): void;
    consume(resetId: string, tokenHash: string): StoredPasswordReset | null;
}
export {};
