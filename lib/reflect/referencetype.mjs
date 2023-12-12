import {
    Type
} from "../../registry.mjs";
const privateBag = new WeakMap();
export class ReferenceType extends Type {
    /**
     * @param { String } name
     * @param { class | Object | Array } refType
     * @param { Boolean } isArray
    */
    constructor(name, refType, isArray) {
        if (isArray) {
            super(name, Array, isArray);
        } else {
            super(name, Object, isArray);
        }
        if (!refType) {
            throw new Error('refType argument is null or undefined');
        }
        if (!refType.name) {
            throw new Error('refType argument does not have a name');
        }
        privateBag.set(this, refType);
    }
    /**
     * @returns { class | Object | Array }
    */
    get type() {
        return privateBag.get(this);
    }
}