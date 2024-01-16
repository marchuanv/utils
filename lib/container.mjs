import {
    ClassInterface,
    Schema
} from '../registry.mjs';
const privateBag = new WeakMap();
export class Container extends Schema {
    /**
     * @param { class } targetClass
    */
    constructor(args, targetClass = null) {
        let Class = new.target;
        if (Class === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        super();
        if (targetClass) {
            Class = targetClass;
        }
        const _interface = new ClassInterface(Class);
        privateBag.set(this, _interface);
        super.create();
        Object.freeze(this);
    }
    /**
     * @returns { ClassInterface }
    */
    get interface() {
        return privateBag.get(this);
    }
}