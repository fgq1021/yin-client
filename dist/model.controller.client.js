import { ControllerClient } from "./controller.client";
export class ModelControllerClient extends ControllerClient {
    constructor() {
        super(...arguments);
        this.name = 'Model';
    }
}
