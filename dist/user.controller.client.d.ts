import { ControllerClient } from "./controller.client";
export declare class UserControllerClient extends ControllerClient {
    name: string;
    get authApi(): string;
    assignMe(me: any): Promise<any>;
    auth(): Promise<any>;
    authPassword(tel: string, password: string): Promise<any>;
}
