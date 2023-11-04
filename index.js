import {YinClient, yinCab} from "./src/core/index.js";

export const yin = new YinClient()

export const YinClientVue = {
    install: async (app, url) => {
        if (url) yin.url = url
        app.config.globalProperties.$yin = yin;
        app.config.globalProperties.$yinClient = YinClient;
        app.config.globalProperties.$yinCab = yinCab;
        const {reactive} = await import('vue')
        yin.regReactive(reactive)
        yinCab.regReactive(reactive)
        await yin.start()
    }
};

export * from './src/core/index.js'
