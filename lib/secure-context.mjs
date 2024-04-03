import { UUID } from "../registry.mjs";
export class SecureContext extends UUID {
    constructor() {
        super();
        Object.freeze(this);
    }
}