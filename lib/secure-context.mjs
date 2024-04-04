import { randomUUID } from "../registry.mjs";
export class SecureContext {
    constructor() {
        this.Id = randomUUID();
        Object.freeze(this);
    }
}