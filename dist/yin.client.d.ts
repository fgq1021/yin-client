import { Yin } from "./core";
export declare class YinClient extends Yin {
    me: any;
    req: import("axios").AxiosStatic;
    socket: any;
    url: string;
    localStorage: Storage;
    client: boolean;
    constructor(url?: any);
    start(): Promise<void>;
    makeSocketEvents(): void;
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
