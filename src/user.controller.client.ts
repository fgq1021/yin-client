import {ControllerClient} from "./controller.client";

export class UserControllerClient extends ControllerClient {
    public name = 'User'

    get authApi() {
        return this.yin.url + 'auth/'
    }

    async assignMe(me) {
        this.yin.me = await this.module.assign(me);
        this.yin.localStorage.setItem(this.yin.url, me.$token)
        return me
    }

    async create(object) {
        const user = await super.create(object)
        if (this.yin.me.$id)
            return user
        else
            return this.assignMe(user)
    }

    async auth() {
        const me = await this.res(this.req.get(this.authApi, this.config()));
        return this.assignMe(me)
    }

    async authPassword(tel: string, password: string): Promise<any> {
        const me = await this.res(this.req.post(this.authApi + "login", {tel, password}))
        return this.assignMe(me)
    }
}