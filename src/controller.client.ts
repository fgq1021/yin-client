import {ResList} from "yin-core";

export class ControllerClient {
    public name
    public module
    protected yin

    constructor(yin, module) {
        this.yin = yin
        this.module = module
    }

    init() {
    }

    get api() {
        return this.yin.url + this.name.toLowerCase() + 's/'
    }

    get req() {
        return this.yin.req
    }

    async res(promise) {
        try {
            const res = (await promise).data
            if (res.$name)
                return res
            else if (res.list)
                return new ResList(res.list, res)
            else
                return res
        } catch (err) {
            if (err.response)
                return Promise.reject(err.response.data)
            else
                return Promise.reject(err)
        }
    }

    config(progress?) {
        const config = {
            headers: {},
            onUploadProgress: (progressEvent) => {
                if (progress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    progress(percentCompleted);
                }
            }
        };
        if (this.yin.me?.$token) {
            config.headers["Authorization"] = "Bearer " + this.yin.me?.$token;
        } else {
            delete config.headers["Authorization"]
        }
        return config;
    }

    // api功能,请输入原始数据
    get(id: string): Promise<object> {
        return this.res(this.req.get(this.api + id, this.config()));
    }

    findOne(filter: object): Promise<object> {
        return this.req.post(this.api + "find?limit=1&skip=0", {filter: filter, sort: {}},
            this.config())
            .then(res => res.data.list[0]);
    }

    find(filter: object = {}, sort: object = {}, limit: number = 50, skip: number = 0): Promise<object> {
        return this.res(this.req.post(this.api + "find?limit=" + limit + "&skip=" + skip,
            {filter: filter, sort}, this.config()))

    }

    create(el) {
        return this.res(this.req.post(this.api, el, this.config()));
    }

    save(el) {
        return this.res(this.req.patch(this.api + el.$id, el, this.config()));
    }

    delete(id) {
        return this.res(this.req.delete(this.api + id, this.config()));
    }

    // children(id, key, limit: number = 50, skip: number = 0, sort = 'default') {
    //     return this.req
    //         .get(this.api + id + "/" + key + '/children/' + sort + "?limit=" + limit + "&skip=" + skip, this.config())
    //         .then(res => res.data);
    // }
    //
    // childrenWithOption(id, key, filter: object = {}, sort: object = {}, limit: number = 50, skip: number = 0) {
    //     return this.req
    //         .post(this.api + id + "/" + key + "/children?limit=" + limit + "&skip=" + skip, this.config())
    //         .then(res => res.data);
    // }

    function(id, key, body) {
        return this.req.post(this.api + id + '/' + key + '/function', body, this.config()).then(res => res.data);
    }
}