import {
    Container,
    MemberParameter,
    Serialiser
} from "../registry.mjs";
describe('when serialising an instance of a class', () => {
    it('should serialise and deserialise with equality', async () => {
        const baby = new Baby('john');
        const serialiser1 = new Serialiser(baby, Baby);
        const serialisedStr1 = await serialiser1.serialise();
        const deserialisedObj = await Serialiser.deserialise(serialisedStr1, Baby);
        const serialiser2 = new Serialiser(deserialisedObj, Baby);
        const serialisedStr2 = await serialiser2.serialise();
        expect(deserialisedObj).toBeInstanceOf(Baby);
        expect(serialisedStr1).toBe(serialisedStr2);
    });
});

class Human extends Container {
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
            new MemberParameter({ name }),
            new MemberParameter({ age }),
            new MemberParameter({ height }),
            new MemberParameter({ weight }),
            new MemberParameter({ parts }),
            new MemberParameter({ organs })
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

class Baby extends Human {
    /**
     * @param { String } name
    */
    constructor(name) {
        super(name, 1, 49, 3.3);
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