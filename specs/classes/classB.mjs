import {
    Container,
    fileURLToPath,
    join
} from "../../registry.mjs";
import {
    ClassA
} from "./classA.mjs";
export class ClassB extends ClassA {
    /**
     * @param { String } name
    */
    constructor(name) {
        super(name, 12, 43, 65);
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
const currentDir = fileURLToPath(new URL('./', import.meta.url))
Container.register(join(currentDir, 'classB.interface.json'), ClassB);