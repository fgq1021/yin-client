import {Yin, UserModule, SystemModule, ModelModule, ElementModule, yinConsole} from "yin-core";
import {UserControllerClient} from "./user.controller.client";
import {ModelControllerClient} from "./model.controller.client";
import {ElementControllerClient} from "./element.controller.client";
import {SystemControllerClient} from "./system.controller.client";
import axios from "axios";
import {io} from "socket.io-client";
import * as Vue from 'vue'

export class YinClient extends Yin {
    public me = {$id: null, $token: ''}
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
        this.me.$token = this.localStorage.getItem(this.url);
    }

    async start() {
        try {
            if (this.me.$token)
                this.me = await this.User.auth()
        } catch (e) {
            yinConsole.warn('自动授权失败', e)
            delete this.me.$token
            this.localStorage.removeItem(this.url)
        }
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
        window.yin = yin
        app.config.globalProperties.$yin = yin;
        app.config.globalProperties.$yinClient = YinClient;
    }
};