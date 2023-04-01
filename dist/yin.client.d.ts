import { Yin } from "yin-core";
export declare class YinClient extends Yin {
    me: {
        $id: any;
        $token: string;
    };
    req: import("axios").AxiosStatic;
    token: any;
    socket: any;
    url: string;
    localStorage: Storage;
    client: boolean;
    constructor(url?: any);
    start(): Promise<void>;
}
declare global {
    interface Window {
        yin: any;
    }
}
declare module 'vue' {
    interface ComponentCustomProperties {
        $yin: YinClient;
        $yinClient: typeof YinClient;
    }
}
export declare const YinClientVue: {
    install: (app: any, options?: any) => void;
};
