"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenStore = void 0;
const common_1 = require("@nestjs/common");
let RefreshTokenStore = class RefreshTokenStore {
    store = new Map();
    save(token, userId, expiresAt) {
        this.store.set(token, { userId, expiresAt });
    }
    has(token) {
        const entry = this.store.get(token);
        if (!entry) {
            return false;
        }
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(token);
            return false;
        }
        return true;
    }
    delete(token) {
        this.store.delete(token);
    }
    clearExpired() {
        const now = Date.now();
        for (const [token, entry] of this.store) {
            if (entry.expiresAt <= now) {
                this.store.delete(token);
            }
        }
    }
};
exports.RefreshTokenStore = RefreshTokenStore;
exports.RefreshTokenStore = RefreshTokenStore = __decorate([
    (0, common_1.Injectable)()
], RefreshTokenStore);
//# sourceMappingURL=refresh-token.store.js.map