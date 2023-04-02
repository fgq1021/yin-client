var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Yin, UserModule, SystemModule, ModelModule, ElementModule, yinConsole } from "yin-core";
import { UserControllerClient } from "./user.controller.client";
import { ModelControllerClient } from "./model.controller.client";
import { ElementControllerClient } from "./element.controller.client";
import { SystemControllerClient } from "./system.controller.client";
import axios from "axios";
import { io } from "socket.io-client";
export class YinClient extends Yin {
    constructor(url) {
        //注册客户端组件
        super([UserModule, UserControllerClient], [ModelModule, ModelControllerClient], [ElementModule, ElementControllerClient], [SystemModule, SystemControllerClient]);
        this.me = { $id: null, $token: '' };
        this.req = axios;
        this.url = location.origin + "/api/";
        this.localStorage = localStorage;
        this.client = true;
        Object.defineProperty(this, 'client', { value: true, writable: false, configurable: false });
        if (url)
            this.url = url;
        this.socket = io(this.url.replace("/api", ""));
        this.me.$token = this.localStorage.getItem(this.url);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.me.$token)
                    this.me = yield this.User.auth();
            }
            catch (e) {
                yinConsole.warn('自动授权失败', e);
                delete this.me.$token;
                this.localStorage.removeItem(this.url);
            }
        });
    }
}
export const YinClientVue = {
    install: (app, options) => {
        const yin = new YinClient(options);
        window.yin = yin;
        app.config.globalProperties.$yin = yin;
        app.config.globalProperties.$yinClient = YinClient;
    }
};
