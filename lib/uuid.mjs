import {
    randomUUID
} from '../registry.mjs';
export class UUID {
    constructor() {
        this.Id = randomUUID();
        Object.freeze();
    }
    toString() {
        return this.Id;
    }
}