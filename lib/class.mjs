import { ClassCtor } from "./class.ctor.mjs";
const privateBag = new WeakMap();
export class Class {
    /**
     * @param { String } name
     * @param { ClassCtor } classCtor
    */
    constructor(name, classCtor) {
        privateBag.set(this, {
            name,
            classCtor
        });
    }
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    get ctor() {
        const { classCtor } = privateBag.get(this);
        return classCtor;
    }
}