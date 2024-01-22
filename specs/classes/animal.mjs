import {
    Container,
    MemberParameter
} from '../../registry.mjs';
export class Animal extends Container {
    /**
     * @param { String } name
     * @param { Boolean } isAdultFood
    */
    constructor(type) {
        super([
            new MemberParameter({ type }, String)
        ]);
    }
    /**
     * @returns { String }
    */
    get type() {
        return super.get({ type: null });
    }
    /**
     * @param { String } value
    */
    set type(value) {
        super.set({ type: value });
    }
}