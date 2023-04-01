import { ControllerClient } from "./controller.client";
export class SystemControllerClient extends ControllerClient {
    constructor() {
        super(...arguments);
        this.name = 'System';
    }
}
