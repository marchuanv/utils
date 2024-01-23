import {
    Animal, Food,
} from '../index.mjs';
export class Dog extends Animal {
    /**
     * @param { String } name
     * @param { Number } age
     * @param { Number } weight
     * @param { Food } food
    */
    constructor(name, age, weight, food) {
        super(name, age, weight, food);
    }
    /**
     * @returns { String }
    */
    get name() {
        return super.get({ name: null });
    }
    /**
     * @param { String } value
    */
    set name(value) {
        super.set({ name: value });
    }
    /**
     * @returns { Number }
    */
    get age() {
        return super.get({ age: null });
    }
    /**
     * @param { Number } value
    */
    set age(value) {
        super.set({ age: value });
    }
    /**
     * @returns { Number }
    */
    get weight() {
        return super.get({ weight: null });
    }
    /**
     * @param { Number } value
    */
    set weight(value) {
        super.set({ weight: value });
    }
    /**
     * @returns { Food }
    */
    get food() {
        return super.get({ food: null });
    }
    /**
     * @param { Food } value
    */
    set food(value) {
        super.set({ food: value });
    }
}