const privateBag = new WeakMap();
import { randomUUID } from 'node:crypto';
export class GUID {
    /**
     * @param { String } Id
    */
    constructor(Id = null) {
        if (Id) {
            privateBag.set(this, Id);
        } else {
            privateBag.set(this, randomUUID());
        }
    }
    toString() {
        const guid = privateBag.get(this);
        return guid;
    }
}