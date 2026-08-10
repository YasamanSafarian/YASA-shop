"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN ?? '1800', 10),
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '604800', 10),
    },
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
});
//# sourceMappingURL=configuration.js.map