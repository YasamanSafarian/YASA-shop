export declare class RefreshTokenStore {
    private readonly store;
    save(token: string, userId: string, expiresAt: number): void;
    has(token: string): boolean;
    delete(token: string): void;
    deleteForUser(userId: string): void;
    clearExpired(): void;
}
