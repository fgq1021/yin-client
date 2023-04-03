import { Module } from "../core/module";
import { YinObject } from "../core/object";
export class ElementModule extends Module {
    constructor(yin, controller) {
        super(yin, controller);
        this.name = 'Element';
        const _this = this;
        this.Object = class Element extends YinObject {
            constructor() {
                super(...arguments);
                this.$name = 'Element';
            }
            get $api() {
                return _this;
            }
        };
        this.init();
    }
}
