"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'internal server error';
        if (exception.code === 'P2002') {
            status = common_1.HttpStatus.CONFLICT;
            message = 'duplicate value already exists';
        }
        else if (exception.code === 'P2003') {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = 'invalid reference';
        }
        else if (exception.code === 'P2025') {
            status = common_1.HttpStatus.NOT_FOUND;
            message = 'record not found';
        }
        const driverError = exception.meta?.driverAdapterError;
        if (driverError?.cause?.originalCode === '23514') {
            status = common_1.HttpStatus.BAD_REQUEST;
            message =
                'value violates a database constraint (e.g. compare price must not exceed price)';
        }
        response.status(status).json({
            statusCode: status,
            message,
        });
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = __decorate([
    (0, common_1.Catch)(client_1.Prisma.PrismaClientKnownRequestError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map