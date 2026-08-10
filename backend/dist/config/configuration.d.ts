declare const _default: () => {
    port: number;
    database: {
        url: string | undefined;
    };
    jwt: {
        accessSecret: string | undefined;
        accessExpiresIn: number;
        refreshSecret: string | undefined;
        refreshExpiresIn: number;
    };
    bcryptRounds: number;
};
export default _default;
