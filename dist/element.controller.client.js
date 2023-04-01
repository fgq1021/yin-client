import { ControllerClient } from "./controller.client";
export class ElementControllerClient extends ControllerClient {
    constructor() {
        super(...arguments);
        this.name = 'Element';
    }
}
