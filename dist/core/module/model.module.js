var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Module } from "../core/module";
import { YinObject } from "../core/object";
import { Key, Types } from "../core/key";
import { Place } from "../core/place";
export class ModelModule extends Module {
    constructor(yin, controller) {
        super(yin, controller);
        this.name = 'Model';
        // 下一步要把Type写成单独的模块，并且用SSR生成表单，以此动态添加类型输入
        this.Place = Place;
        this.Types = Types;
        this.Key = Key;
        const _this = this;
        this.Object = class Model extends YinObject {
            constructor() {
                super(...arguments);
                this.$name = 'Model';
            }
            get $api() {
                return _this;
            }
            get $model() {
                return (user) => this.$api.get(this.$.model || this.$id, user);
            }
            set $model(o) {
                super.$model = o;
            }
            $readable(user) {
                return __awaiter(this, void 0, void 0, function* () {
                    return true;
                });
            }
        };
        this.init();
    }
}
