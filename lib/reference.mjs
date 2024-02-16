import {
    GUID
} from '../registry.mjs';
const privateBag = new WeakMap();
const rootId = new GUID();
let lock = true;
/**
 * @callback RefCondition
 * @param { GUID } Id
*/
export class Reference {
    /**
     * @param { GUID } Id
    */
    constructor(Id) {
        if (lock) {
            throw new Error(`${Reference.name} is a static class`);
        }
        privateBag.set(this, Id);
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        return privateBag.get(this);
    }
    /**
     * @param { RefCondition } condition
     * @returns { Boolean }
    */
    references(condition) {
        const refs = privateBag.get(this.Id);
        if (refs.length === 0) {
            return null;
        }
        return refs.find(Id => condition(Id)) !== undefined;
    }
    /**
     * @param { GUID } refId
    */
    static create(refId) {
        const Id = new GUID();
        let _refId = refId || rootId;
        if (_refId === rootId) {
            if (!privateBag.has(rootId)) {
                privateBag.set(rootId, []);
            }

        }
        privateBag.get(_refId).push(Id);
        privateBag.set(Id, [_refId]);
        lock = false;
        const ref = new Reference(Id);
        lock = true;
        return ref;
    }
}