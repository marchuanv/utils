import {
    GUID
} from '../registry.mjs';
const privateBag = new WeakMap();
const rootId = new GUID();
let nextIndex = null;
let currentIndex = { position: 0, Id: rootId };
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
    /**
     * @returns { Boolean }
    */
    static get next() {
        const _indexes = indexes();
        let foundIndex = _indexes.find(i => i.Id === currentIndex.Id);
        if (foundIndex) {
            let refs = privateBag.get(foundIndex.Id);
            foundIndex.position = foundIndex.position + 1;
            if (foundIndex.position < refs.length - 1) {
                foundIndex.Id = refs[foundIndex.position];
                currentIndex = foundIndex;
            } else {
                refs = privateBag.get(currentIndex.Id);
                const refsFound = _indexes.filter(({ Id }) => refs.find(Id2 => Id2 === Id));
                if (refsFound.length > 0) {
                    debugger;
                }
                const refsUsed = refsFound.find(r => r.position >= (refs.length - 1));
                if (refsUsed) {
                    return false;
                }
                currentIndex = { position: 0, Id: refs[0] };
                _indexes.push(currentIndex);
            }
        } else {
            const refs = privateBag.get(currentIndex.Id);
            currentIndex = { position: 0, Id: refs[0] };
            _indexes.push(currentIndex);
        }
        if (currentIndex.Id) {
            return true;
        }
        return false;
    }
    /**
    * @returns { GUID }
    */
    static get current() {
        return currentIndex.Id;
    }
}
class Indexes { }
privateBag.set(Indexes, []);
function indexes() {
    return privateBag.get(Indexes);
}