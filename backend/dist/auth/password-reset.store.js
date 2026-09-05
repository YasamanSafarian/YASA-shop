"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetStore = void 0;
const common_1 = require("@nestjs/common");
let PasswordResetStore = class PasswordResetStore {
    store = new Map();
    save(resetId, userId, tokenHash, expiresAt) {
        this.store.set(resetId, { userId, tokenHash, expiresAt });
    }
    consume(resetId, tokenHash) {
        const entry = this.store.get(resetId);
        if (!entry) {
            return null;
        }
        if (entry.expiresAt <= Date.now() || entry.tokenHash !== tokenHash) {
            this.store.delete(resetId);
            return null;
        }
        this.store.delete(resetId);
        return entry;
    }
};
exports.PasswordResetStore = PasswordResetStore;
exports.PasswordResetStore = PasswordResetStore = __decorate([
    (0, common_1.Injectable)()
], PasswordResetStore);
//# sourceMappingURL=password-reset.store.js.map