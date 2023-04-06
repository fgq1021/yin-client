var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ElementModule, ModelModule, Place, SystemModule, UserModule, Yin, yinConsole } from "./core";
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
        this.makeSocketEvents();
        this.me.$token = this.localStorage.getItem(this.url);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.me.$token)
                    this.me = yield this.User.auth();
                // this.me.$title = 1
                // setInterval(() => {
                //     this.me.$title++
                // }, 1000)
            }
            catch (e) {
                yinConsole.warn('自动授权失败', e);
                delete this.me.$token;
                this.localStorage.removeItem(this.url);
            }
        });
    }
    makeSocketEvents() {
        // this.socket.on('connect', r => console.log(r))
        this.socket.on("disconnect", (reason) => {
            yinConsole.log("连接已断开:", reason);
            this.runEventFn("disconnect", "连接已断开");
            yinConsole.log("连接重启中:正在尝试重新连接服务器");
        });
        this.socket.io.on("reconnect", () => __awaiter(this, void 0, void 0, function* () {
            yinConsole.log("连接重启中:服务器已连接");
            try {
                yield this.User.auth();
                yinConsole.log("连接重启中:数据更新正在恢复");
                for (let module of this.modules) {
                    module.api.hotReloadRestart();
                }
                yinConsole.log("连接已重启");
                yield this.runEventFn("reconnect", "连接已重启");
            }
            catch (e) {
                location.reload();
            }
        }));
        this.socket.on("update", data => {
            // console.log('socket update', data)
            const { id, type, changeId } = data;
            const p = new Place(id);
            if (p.key) {
                // yinConsole.log("收到[" + p.module + "]更新：", type, id);
                this[p.module].childrenUpdate(id, changeId, type);
            }
            else {
                // yinConsole.log("收到" + p.module + "更新：", type, id);
                this[p.module].refresh(p.id);
            }
        });
        this.socket.on("delete", ({ id }) => {
            yinConsole.warn("收到删除：", id);
            const p = new Place(id);
            this[p.module].afterDelete(p.id);
        });
    }
}
export const YinClientVue = {
    install: (app, options) => {
        const yin = new YinClient(options);
        yin.start();
        app.config.globalProperties.$yin = yin;
        app.config.globalProperties.$yinClient = YinClient;
    }
};
