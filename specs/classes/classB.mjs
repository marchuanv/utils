import {
    ClassA
} from "../../registry.mjs";
export class ClassB extends ClassA {
    /**
     * @param { String } name
    */
    constructor(name) {
        super(name);
    }
    /**
     * @returns { String }
    */
    get name() {
        return this._name;
    }
    /**
     * @param { String } value
    */
    set name(value) {
        this._name = value;
    }
    /**
     * @param { Number } age
    */
    setAge(age) {
        super.age = age;
    }
}