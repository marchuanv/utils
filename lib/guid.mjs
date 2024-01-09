import { randomUUID } from "../registry.mjs";
const privateBag = new WeakMap();
class GUID {
    constructor() {
        privateBag.set(this, randomUUID());
    }
    toString() {
        const guid = privateBag.get(this);
        return guid;
    }
}