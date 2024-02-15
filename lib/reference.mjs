import {
    GUID
} from '../registry.mjs';
const privateBag = new WeakMap();
const keys = {};
privateBag.set(keys, []);
export class Reference {
    /**
     * @param { GUID } ref
    */
    constructor(ref = null) {
        if (new.target !== Reference.prototype && new.target !== Reference) {
            throw new Error(`${Reference.name} is a sealed class`);
        }
        let refId = null;
        if (ref) {
            refId = privateBag.get(ref);
        } else {
            refId = privateBag.get(Reference);
        }
        const Id = new GUID();
        privateBag.get(keys).push(Id);
        privateBag.set(Id, refId);
        privateBag.set(this, Id);
    }
    /**
     * @returns { GUID }
    */
    get Id() {
        const Id = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { GUID }
    */
    get refId() {
        const Id = privateBag.get(this);
        return privateBag.get(Id);
    }
    /**
     * @param { GUID | String } Id
     * @returns { Reference }
    */
    static get(Id) {
        const guidKey = privateBag.get(keys).find(key => key.toString() === (typeof Id === 'string' ? Id : Id.toString()));
        return privateBag.get(guidKey);
    }
}
privateBag.set(Reference, new GUID());