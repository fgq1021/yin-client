export declare class ResList {
    list: any[];
    filter: {};
    sort: {};
    total: number;
    skip: number;
    constructor(list: any, option?: any);
}
export declare class YinArray extends Array {
    option: {
        filter: {};
        sort: {};
        total: number;
        fixed: number;
        $skip: number;
    };
    user: any;
    api: any;
    loading: boolean;
    constructor(option: any, api: any, user?: any);
    get(num: any, skip?: number): Promise<void>;
    children(num: any, skip?: number): Promise<void>;
    getWaiter(limit?: number, skip?: number): Promise<unknown>;
    getFromController(limit?: number, skip?: number): Promise<void>;
    create(object: any): any;
    res(): ResList;
}
export declare class YinChildren {
    parent: any;
    fixedList: any[];
    children: any[];
    filter: {
        $parents: any;
    };
    index: {};
    childrenTotal: number;
    place: any;
    loading: boolean;
    yin: any;
    module: any;
    userList: {};
    readTimes: number;
    lastRead: Date;
    constructor(place: string, yin: any, module: any);
    get list(): any[];
    get fixed(): number;
    get total(): number;
    init(): Promise<this>;
    toArray(user?: any, once?: any): any;
    find(filter: any, sort: any, limit?: number, skip?: number, user?: any): Promise<ResList>;
    get(limit?: number, skip?: number, user?: any): Promise<ResList>;
    getWaiter(limit?: number, skip?: number, user?: any): Promise<ResList>;
    getFromController(limit?: number, skip?: number): Promise<void>;
    getFromCache(limit?: number, skip?: number, user?: any): Promise<ResList>;
    create(object: any): any;
}
