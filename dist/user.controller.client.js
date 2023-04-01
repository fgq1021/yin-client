var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ControllerClient } from "./controller.client";
export class UserControllerClient extends ControllerClient {
    constructor() {
        super(...arguments);
        this.name = 'User';
    }
    get authApi() {
        return this.yin.url + 'auth/';
    }
    assignMe(me) {
        return __awaiter(this, void 0, void 0, function* () {
            this.yin.me = yield this.module.assign(me);
            this.yin.localStorage.setItem(this.yin.url, me.$token);
            return me;
        });
    }
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            const me = yield this.res(this.req.get(this.authApi, this.config()));
            return this.assignMe(me);
        });
    }
    authPassword(tel, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const me = yield this.res(this.req.post(this.authApi + "login", { tel, password }));
            return this.assignMe(me);
        });
    }
}
