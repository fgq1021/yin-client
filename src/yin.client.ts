import {ElementModule, ModelModule, Place, SystemModule, UserModule, Yin, yinConsole, yinStatus} from "./core";
import {UserControllerClient} from "./user.controller.client";
import {ModelControllerClient} from "./model.controller.client";
import {ElementControllerClient} from "./element.controller.client";
import {SystemControllerClient} from "./system.controller.client";
import axios from "axios";
import {io} from "socket.io-client";
import * as Vue from 'vue'

export class YinClient extends Yin {
    public me = {$id: null, $token: ''} as any
    public req = axios
    public socket
    public url = location.origin + "/api/"
    public localStorage = localStorage
    public client = true

    constructor(url?) {
        //注册客户端组件
        super(
            [UserModule, UserControllerClient],
            [ModelModule, ModelControllerClient],
            [ElementModule, ElementControllerClient],
            [SystemModule, SystemControllerClient]
        );
        Object.defineProperty(this, 'client', {value: true, writable: false, configurable: false})
        if (url)
            this.url = url
        this.socket = io(this.url.replace("/api", ""));
        this.makeSocketEvents();
        this.me.$token = this.localStorage.getItem(this.url);
    }

    async start() {
        try {
            if (this.me.$token)
                this.me = await this.User.auth()
            // this.me.$title = 1
            // setInterval(() => {
            //     this.me.$title++
            // }, 1000)
        } catch (e) {
            yinConsole.warn('自动授权失败', e)
            delete this.me.$token
            this.localStorage.removeItem(this.url)
        }
    }

    makeSocketEvents() {
        console.log(this.socket)
        this.socket.on('connect', r => console.log(r))
        this.socket.on("disconnect", (reason) => {
            console.log("连接已断开:", reason);
            this.runEventFn("disconnect", "连接已断开");
            console.log("连接重启中:正在尝试重新连接服务器");
        });
        this.socket.io.on("reconnect", async () => {
            console.log("连接重启中:服务器已连接");
            try {
                await this.User.auth();
                console.log("连接重启中:数据更新正在恢复");
                for (let module of this.modules) {
                    module.api.hotReloadRestart();
                }
                console.log("连接已重启");
                await this.runEventFn("reconnect", "连接已重启");
            } catch (e) {
                location.reload();
            }
        });
        this.socket.on("update", ({id, type, changeId}) => {
            const p = new Place(id);
            if (p.key) {
                yinConsole.log("收到[" + p.module + "]更新：", type, id);
                this[p.module].childrenUpdate(id, changeId, type);
            } else {
                yinConsole.log("收到" + p.module + "更新：", type, id);
                this[p.module].refresh(p.id);
            }
        });
        this.socket.on("delete", ({id}) => {
            yinConsole.warn("收到删除：", id);
            const p = new Place(id);
            this[p.module].afterDelete(p.id);
        });
    }
}

declare global {
    interface Window {
        yin: any;
    }
}


declare module 'vue' {
    interface ComponentCustomProperties {
        $yin: YinClient
        $yinClient: typeof YinClient
    }
}

export const YinClientVue = {
    install: (app, options?) => {
        const yin = new YinClient(options)
        yin.start()
        app.config.globalProperties.$yin = yin;
        app.config.globalProperties.$yinClient = YinClient;
    }
};