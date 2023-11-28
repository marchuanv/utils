
import { reflection } from '../registry.mjs';
describe('when ', () => {
    it('should', () => {
        const member = reflection.getMember(Baby, Human);
        expect(member).toBeDefined();

        const humanMember = member.find(Human.name, true, false, false);
        expect(humanMember).toBeDefined();

        const babyProperties = member.findAll('name', false, true, false);
        expect(babyProperties.length).toBe(2);

        const humanProperties = humanMember.findAll('age', false, true, false);
        expect(humanProperties.length).toBe(2);
    });
});

class Human {
    constructor(age = 1, parts = ['head', 'feet', 'legs', 'arms'], height, weight) {
        this._age = age;
    }
    get age() {
        return this._age;
    }
    set age(value) {
        this._age = value;
    }
}

class Baby extends Human {
    constructor(name) {
        this._name = name;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
}