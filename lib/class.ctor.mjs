import { ClassCtorParameter } from "./class.ctor.parameter.mjs";
const privateBag = new WeakMap();
export class ClassCtor {
    /**
     * @param { String } name
     * @param { Array<ClassCtorParameter> } classCtorParameters
     */
    constructor(name, classCtorParameters) {
        privateBag.set(this, { name, classCtorParameters });
    }
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    get parameters() {
        const { classCtorParameters } = privateBag.get(this);
        return classCtorParameters;
    }
}