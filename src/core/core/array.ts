import {Place} from "./place";

export class ResList {
    public list = []
    public filter = {}
    public sort = {}
    public total = 0
    public skip = 0

    constructor(list, option?) {
        if (list.list && !option) {
            this.list = list.list
            option = list
        } else {
            this.list = list
        }
        delete option.list

        for (let key in option) {
            option[key] = option[key] || 0;
            option[key] = Number(option[key]) ? Number(option[key]) : option[key]
        }
        Object.assign(this, option)
    }
}

export class YinArray extends Array {
    public option = {
        filter: {},
        sort: {},
        total: 0,
        fixed: 0,
        $skip: 0
    }
    public user
    public api
    public loading = false

    constructor(option, api, user?) {
        super()
        Object.assign(this.option, option)
        this.api = api
        this.user = user
    }

    async get(num, skip = this.option.$skip) {
        if (this.api.place) {
            await this.children(num, skip)
        } else {
            await this.getWaiter(num, skip)
        }
    }

    async children(num, skip = this.option.$skip) {
        const res = await this.api.get(num, skip, this.user)
        let l = skip
        this.option.$skip = res.skip
        this.option.total = res.total
        if (skip === this.option.$skip)
            l = this.length
        for (let i in res.list) {
            this[l + Number(i)] = res.list[i]
        }
    }

    async getWaiter(limit = 50, skip = 0) {
        if (!this.loading)
            return this.getFromController(limit, skip);
        else
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.getWaiter(limit, skip))
                }, 100)
            });
    }

    async getFromController(limit = 50, skip = 0) {
        this.loading = true
        const res = await this.api.api.find(this.option.filter, this.option.sort, limit, skip)
        let cantRead = 0
        this.option.total = res.total
        this.option.$skip = res.skip
        for (let i in res.list) {
            this.api.assign(res.list[i])
            const object = await this.api.get(res.list[i].$id)
            if (await object.$readable(this.user))
                this[skip + Number(i) - cantRead] = object
            else
                cantRead++
        }
        if (cantRead && res.skip < res.total) {
            await this.getFromController(Math.min(cantRead, res.total - res.skip), res.skip)
        }
        this.loading = false
    }

    create(object) {
        return this.api.create(object)
    }

    res() {
        return new ResList(this, this.option)
    }
}


export class YinChildren {
    public parent
    public fixedList = []
    public children = []
    public filter = {
        $parents: null
    }
    public index = {}
    public childrenTotal = 0
    public place
    public loading = true
    public yin
    public module
    public userList = {}

    public readTimes = 0
    public lastRead = new Date()

    constructor(place: string, yin, module) {
        this.place = new Place(place)
        this.yin = yin
        this.module = module
    }


    get list() {
        return this.fixedList.concat(this.children)
    }

    get fixed() {
        return this.fixedList.length
    }

    get total() {
        return this.fixed + this.childrenTotal
    }

    async init() {
        this.parent = await this.module.get(this.place.id)
        const indexes = this.parent.$data[this.place.key] || {default: {}}
        this.index = indexes[this.place.index]
        this.fixedList = this.parent.$children[this.place.key] || []
        this.filter.$parents = this.place.idKey
        this.loading = false
        await this.getFromController(10, 0)
        return this
    }


    toArray(user?, once?) {
        if (once)
            return new YinArray({}, this, user)
        else if (user) {
            this.userList[user.$id] = new this.yin.vue.reactive(new YinArray({}, this, user))
            return this.userList[user.$id]
        }
    }

    find(filter, sort, limit = 50, skip = 0, user?) {
        return this.get(limit, skip, user)
    }

    async get(limit = 50, skip = 0, user?) {
        this.readTimes++
        this.lastRead = new Date()
        const res = await this.getWaiter(limit, skip, user)
        return new ResList(res.list, res)
    }

    async getWaiter(limit = 50, skip = 0, user?): Promise<ResList> {
        if (!this.loading)
            return this.getFromCache(limit, skip, user);
        else
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.getWaiter(limit, skip, user))
                }, 100)
            });
    }

    async getFromController(limit = 50, skip = 0) {
        this.loading = true
        let res = await this.module.api.find(this.filter, this.index, limit, skip)
        this.childrenTotal = res.total
        for (let i in res.list) {
            await this.module.assign(res.list[i])
            this.children[Number(i) + skip] = res.list[i].$id;
        }
        this.loading = false
    }

    async getFromCache(limit = 50, skip = 0, user?) {
        // console.log('getFromCache', limit, skip)
        const res = [], notFoundFixedList = [], notFoundList = [], manageable = await this.parent.$manageable(user)
        let i = skip;
        while ((res.length < limit) && (i < this.total)) {
            // console.log(res.length, limit, i, this.total)
            if (i < this.fixed) {
                for (let i in this.fixedList) {
                    try {
                        res.push(await this.yin.get(this.fixedList[i], user));
                    } catch (e) {
                        if (e.status === "NOT_FOUND")
                            notFoundFixedList.push(i);
                        else if (manageable)
                            res.push({$id: this.fixedList[i], hide: true})
                    }
                }
            } else {
                // const c = i - this.fixed
                let subId = this.children[i];
                if (!subId) {
                    await this.getFromController(limit + 50, i);
                    subId = this.children[i];
                }
                try {
                    const el = await this.module.get(subId, user);
                    res.push(el);
                } catch (e) {
                    if (e.status === "NOT_FOUND")
                        notFoundList.push(i);
                }
            }
            i++;
        }

        if (!this.yin.client) {
            notFoundFixedList.reverse();
            for (let index of notFoundFixedList) {
                this.parent.$children[this.place.key].splice(index, 1);
            }

            if (notFoundFixedList.length)
                await this.parent.$save(this.yin.me);
        }


        notFoundList.reverse()
        for (let index of notFoundList) {
            this.children.splice(index, 1);
        }

        // 此处返回的skip为：总列表鉴权后的skip数
        return new ResList(res, {skip: i, total: this.total})
    }

    create(object) {
        return this.parent[this.place.key].create(object)
    }
}