export declare class ControllerClient {
    name: any;
    module: any;
    protected yin: any;
    constructor(yin: any, module: any);
    init(): void;
    get api(): string;
    get req(): any;
    res(promise: any): Promise<any>;
    config(progress?: any): {
        headers: {};
        onUploadProgress: (progressEvent: any) => void;
    };
    get(id: string): Promise<object>;
    findOne(filter: object): Promise<object>;
    find(filter?: object, sort?: object, limit?: number, skip?: number): Promise<object>;
    create(el: any): Promise<any>;
    save(el: any): Promise<any>;
    delete(id: any): Promise<any>;
    function(id: any, key: any, body: any): any;
}
