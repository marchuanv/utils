import {
    Container,
    MemberParameter
} from "../../registry.mjs";
export class ClassA extends Container {
    /**
     * @param { String } name
     * @param { Number } age
     * @param { Number } height
     * @param { Number } weight
     * @param { Array<String> } parts
     * @param {{ heart: Boolean }} organs
    */
    constructor(name, age, height, weight, parts = ['head', 'feet', 'legs', 'arms'], organs = { heart: true }) {
        super([
            new MemberParameter({ name }, String),
            new MemberParameter({ age }, Number),
            new MemberParameter({ height }, Number),
            new MemberParameter({ weight }, Number),
            new MemberParameter({ parts }, Array),
            new MemberParameter({ organs }, Object)
        ]);
    }
    /**
     * @returns { Number }
    */
    get age() {
        return this._age;
    }
    /**
     * @param { Number } value
    */
    set age(value) {
        this._age = value;
    }
    /**
     * @param { Number } age
     * @param { Array<String> } parts
     * @param { Number } height
     * @param { Number } weight
     * @param {{ heart: Boolean }} organs
     * @returns { Human }
    */
    static create(age = 1, parts = ['head', 'feet', 'legs', 'arms'], height, weight, organs = { heart: true }) {
    }
}
