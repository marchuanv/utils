import { ClassMember } from "../registry.mjs";

describe('when ', () => {
    it('should', () => {
        const babyClassMember = new ClassMember(Baby);
        let methods = babyClassMember.findAll({ isMethod: true });
        let ctorMethods = babyClassMember.findAll({ isMethod: true, isCtor: true });
        let staticMethods = babyClassMember.findAll({ isMethod: true, isStatic: true });
        let properties = babyClassMember.findAll({ isProperty: true });
        expect(methods.length).toBe(1);
        expect(ctorMethods.length).toBe(1);
        expect(staticMethods.length).toBe(0);
        expect(properties.length).toBe(2);
        const humanClassMember = babyClassMember.find('Human', true, false, false, false, false);
        methods = humanClassMember.findAll({ isMethod: true });
        ctorMethods = babyClassMember.findAll({ isMethod: true, isCtor: true });
        staticMethods = humanClassMember.findAll({ isMethod: true, isStatic: true });
        properties = humanClassMember.findAll({ isProperty: true });
        expect(methods.length).toBe(1);
        expect(ctorMethods.length).toBe(1);
        expect(staticMethods.length).toBe(1);
        expect(properties.length).toBe(2);
    });
});

class Human {
    /**
     * @param { Number } age
     * @param { Array<String> } parts
     * @param { Number } height
     * @param { Number } weight
     * @param {{ heart: Boolean }} organs
    */
    constructor(age = 1, parts = ['head', 'feet', 'legs', 'arms'], height, weight, organs = { heart: true }) {
        this._age = age;
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
    */
    static create(age = 1, parts = ['head', 'feet', 'legs', 'arms'], height, weight, organs = { heart: true }) {
    }
}

class Baby extends Human {
    /**
     * @param { String } name
    */
    constructor(name) {
        this._name = name;
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