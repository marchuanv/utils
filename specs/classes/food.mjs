import {
    Container,
    MemberParameter
} from '../../registry.mjs';
export class Food extends Container {
    /**
     * @param { String } name
     * @param { Boolean } isAdultFood
    */
    constructor(name, isAdultFood) {
        super([
            new MemberParameter({ name }, String),
            new MemberParameter({ isAdultFood }, String)
        ]);
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
     * @returns { Boolean }
    */
    get isAdultFood() {
        return super.get({ isAdultFood: null });
    }
    /**
     * @param { Boolean } value
    */
    set isAdultFood(value) {
        super.set({ isAdultFood: value });
    }
}