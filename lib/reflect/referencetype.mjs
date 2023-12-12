import {
    Type
} from "../../registry.mjs";
const privateBag = new WeakMap();
export class ReferenceType extends Type {
    /**
     * @param { String } name
     * @param { String } Id
     * @param { class | Object | Array } refType
     * @param { Boolean } isArray
    */
    constructor(name, Id, refType, isArray) {
        let _refType = refType;
        if (isArray) {
            super(name, Id, Array, []);
            _refType = Array;
        } else if (refType === Object) {
            super(name, Id, Object, null);
            _refType = Object;
        } else {
            super(name, Id, Object, null);
        }
        if (!_refType) {
            throw new Error('refType argument is null or undefined');
        }
        if (!_refType.name) {
            throw new Error('refType argument does not have a name');
        }
        privateBag.set(this, _refType);
    }
    /**
     * @returns { class | Object | Array }
    */
    get type() {
        return privateBag.get(this);
    }
}