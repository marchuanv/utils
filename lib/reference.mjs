import {
    GUID
} from '../registry.mjs';
const privateBag = new WeakMap();
const rootId = new GUID();
let lock = true;
/**
 * @callback RefCondition
 * @param { Reference } ref
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
    */
    find(condition) {
        const refs = privateBag.get(this.Id);
        lock = false;
        const references = refs.map(Id => new Reference(Id));
        lock = true;
        return references.find(ref => condition(ref));
    }
    /**
     * @param { GUID } refId
    */
    static create(refId) {
        const Id = new GUID();
        let _refId = refId || rootId;
        if (_refId === rootId) {
            if(!privateBag.has(rootId)) {
                privateBag.set(rootId, []);
            }
            privateBag.get(rootId).push(Id);
        }
        privateBag.set(Id, [_refId]);
        lock = false;
        const ref = new Reference(Id);
        lock = true;
        return ref;
    }
}