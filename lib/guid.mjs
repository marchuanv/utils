const privateBag = new WeakMap();
import { randomUUID } from 'node:crypto';
export class GUID {
    constructor() {
        privateBag.set(this, randomUUID());
    }
    toString() {
        const guid = privateBag.get(this);
        return guid;
    }
}