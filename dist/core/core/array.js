var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Place } from "./place";
export class ResList {
    constructor(list, option) {
        this.list = [];
        this.filter = {};
        this.sort = {};
        this.total = 0;
        this.skip = 0;
        if (list.list && !option) {
            this.list = list.list;
            option = list;
        }
        else {
            this.list = list;
        }
        delete option.list;
        for (let key in option) {
            option[key] = option[key] || 0;
            option[key] = Number(option[key]) ? Number(option[key]) : option[key];
        }
        Object.assign(this, option);
    }
}
export class YinArray extends Array {
    constructor(option, api, user) {
        super();
        this.option = {
            filter: {},
            sort: {},
            total: 0,
            fixed: 0,
            $skip: 0
        };
        this.loading = false;
        Object.assign(this.option, option);
        this.api = api;
        this.user = user;
    }
    get(num, skip = this.option.$skip) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.api.place) {
                yield this.children(num, skip);
            }
            else {
                yield this.getWaiter(num, skip);
            }
        });
    }
    children(num, skip = this.option.$skip) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.api.get(num, skip, this.user);
            let l = skip;
            this.option.$skip = res.skip;
            this.option.total = res.total;
            if (skip === this.option.$skip)
                l = this.length;
            for (let i in res.list) {
                this[l + Number(i)] = res.list[i];
            }
        });
    }
    getWaiter(limit = 50, skip = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.loading)
                return this.getFromController(limit, skip);
            else
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.getWaiter(limit, skip));
                    }, 100);
                });
        });
    }
    getFromController(limit = 50, skip = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loading = true;
            const res = yield this.api.api.find(this.option.filter, this.option.sort, limit, skip);
            let cantRead = 0;
            this.option.total = res.total;
            this.option.$skip = res.skip;
            for (let i in res.list) {
                this.api.assign(res.list[i]);
                const object = yield this.api.get(res.list[i].$id);
                if (yield object.$readable(this.user))
                    this[skip + Number(i) - cantRead] = object;
                else
                    cantRead++;
            }
            if (cantRead && res.skip < res.total) {
                yield this.getFromController(Math.min(cantRead, res.total - res.skip), res.skip);
            }
            this.loading = false;
        });
    }
    create(object) {
        return this.api.create(object);
    }
    res() {
        return new ResList(this, this.option);
    }
}
export class YinChildren {
    constructor(place, yin, module) {
        this.fixedList = [];
        this.children = [];
        this.filter = {
            $parents: null
        };
        this.index = {};
        this.childrenTotal = 0;
        this.loading = true;
        this.userList = {};
        this.readTimes = 0;
        this.lastRead = new Date();
        this.place = new Place(place);
        this.yin = yin;
        this.module = module;
    }
    get list() {
        return this.fixedList.concat(this.children);
    }
    get fixed() {
        return this.fixedList.length;
    }
    get total() {
        return this.fixed + this.childrenTotal;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.parent = yield this.module.get(this.place.id);
            const indexes = this.parent.$data[this.place.key] || { default: {} };
            this.index = indexes[this.place.index];
            this.fixedList = this.parent.$children[this.place.key] || [];
            this.filter.$parents = this.place.idKey;
            this.loading = false;
            yield this.getFromController(10, 0);
            return this;
        });
    }
    toArray(user, once) {
        if (once)
            return new YinArray({}, this, user);
        else if (user) {
            this.userList[user.$id] = new this.yin.vue.reactive(new YinArray({}, this, user));
            return this.userList[user.$id];
        }
    }
    find(filter, sort, limit = 50, skip = 0, user) {
        return this.get(limit, skip, user);
    }
    get(limit = 50, skip = 0, user) {
        return __awaiter(this, void 0, void 0, function* () {
            this.readTimes++;
            this.lastRead = new Date();
            const res = yield this.getWaiter(limit, skip, user);
            return new ResList(res.list, res);
        });
    }
    getWaiter(limit = 50, skip = 0, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.loading)
                return this.getFromCache(limit, skip, user);
            else
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.getWaiter(limit, skip, user));
                    }, 100);
                });
        });
    }
    getFromController(limit = 50, skip = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loading = true;
            let res = yield this.module.api.find(this.filter, this.index, limit, skip);
            this.childrenTotal = res.total;
            for (let i in res.list) {
                yield this.module.assign(res.list[i]);
                this.children[Number(i) + skip] = res.list[i].$id;
            }
            this.loading = false;
        });
    }
    getFromCache(limit = 50, skip = 0, user) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('getFromCache', limit, skip)
            const res = [], notFoundFixedList = [], notFoundList = [], manageable = yield this.parent.$manageable(user);
            let i = skip;
            while ((res.length < limit) && (i < this.total)) {
                // console.log(res.length, limit, i, this.total)
                if (i < this.fixed) {
                    for (let i in this.fixedList) {
                        try {
                            res.push(yield this.yin.get(this.fixedList[i], user));
                        }
                        catch (e) {
                            if (e.status === "NOT_FOUND")
                                notFoundFixedList.push(i);
                            else if (manageable)
                                res.push({ $id: this.fixedList[i], hide: true });
                        }
                    }
                }
                else {
                    // const c = i - this.fixed
                    let subId = this.children[i];
                    if (!subId) {
                        yield this.getFromController(limit + 50, i);
                        subId = this.children[i];
                    }
                    try {
                        const el = yield this.module.get(subId, user);
                        res.push(el);
                    }
                    catch (e) {
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
                    yield this.parent.$save(this.yin.me);
            }
            notFoundList.reverse();
            for (let index of notFoundList) {
                this.children.splice(index, 1);
            }
            // 此处返回的skip为：总列表鉴权后的skip数
            return new ResList(res, { skip: i, total: this.total });
        });
    }
    create(object) {
        return this.parent[this.place.key].create(object);
    }
}
