import { GUID, randomUUID } from '../registry.mjs';
class Food {
    constructor(name) {
        this._name = name;
    }
    get name() {
        return this._name;
    }
}
class Animal {
    constructor(kind, food, type) {
        this._kind = kind;
        this._food = food;
        this._type = type;
    }
    get kind() {
        return this._kind;
    }
    get type() {
        return this._type;
    }
    get food() {
        return this._food;
    }
}
class Cat { }
class Dog { }
class TestGUID extends GUID { }
describe('when constructing guids given metadata', () => {
    it('should have equality between two guids having the same metadata', () => {
        let metadata = { Id: randomUUID() };
        let testGUIDA = new TestGUID(metadata);
        let testGUIDB = new TestGUID(metadata);
        expect(testGUIDA).toBe(testGUIDB);
        metadata = randomUUID();
        testGUIDA = new TestGUID(metadata);
        testGUIDB = new TestGUID(metadata);
        expect(testGUIDA).toBe(testGUIDB);
    });
    it('should have equality between two guids having the same class metadata', () => {
        const dog1 = new Animal('dog', new Food('epol'), Dog);
        const dog2 = new Animal('dog', new Food('epol'), Dog);
        const testGUIDA = new TestGUID(dog1);
        const testGUIDB = new TestGUID(dog2);
        expect(testGUIDA).toBe(testGUIDB);
    });
    it('should have equality between two guids having the same complex metadata', () => {
        const testGUIDA = new TestGUID({
            name: "Alice",
            age: 25,
            address: {
                street: "123 Main St",
                city: "Anytown",
                zip: "12345"
            },
            hobbies: ["reading", "painting", "hiking"],
            birthday: new Date("1999-05-15"),
            greet: function () {
                console.log("Hello!");
            },
            regex: /\w+/,
            nestedObjects: {
                obj1: {
                    a: 1,
                    b: 2
                },
                obj2: {
                    x: "foo",
                    y: "bar",
                    z: [1, 2, 3]
                }
            }
        });
        const testGUIDB = new TestGUID({
            name: "Alice",
            age: 25,
            address: {
                street: "123 Main St",
                city: "Anytown",
                zip: "12345"
            },
            hobbies: ["reading", "painting", "hiking"],
            birthday: new Date("1999-05-15"),
            greet: function () {
                console.log("Hello!");
            },
            regex: /\w+/,
            nestedObjects: {
                obj1: {
                    a: 1,
                    b: 2
                },
                obj2: {
                    x: "foo",
                    y: "bar",
                    z: [1, 2, 3]
                }
            }
        });
        expect(testGUIDA).toBe(testGUIDB);
    });
    it('should not have equality between two guids having different metadata', () => {
        const metadata1 = { Id: randomUUID() };
        const metadata2 = { Id: randomUUID() };
        const testGUIDA = new TestGUID(metadata1);
        const testGUIDB = new TestGUID(metadata2);
        expect(testGUIDA).not.toBe(testGUIDB);
    });
    it('should not have equality between two guids having different class metadata', () => {
        const dog1 = new Animal('dog', new Food('epol'), Dog);
        const dog2 = new Animal('dog', new Food('epol'), Cat);
        const testGUIDA = new TestGUID(dog1);
        const testGUIDB = new TestGUID(dog2);
        expect(testGUIDA).not.toBe(testGUIDB);
    });
    it('should not have equality between two guids having different complex metadata', () => {
        const testGUIDA = new TestGUID({
            name: "Alice",
            age: 25,
            address: {
                street: "123 Main St",
                city: "Anytown",
                zip: "12345"
            },
            hobbies: ["reading", "painting", "hiking"],
            birthday: new Date("1999-05-15"),
            greet: function () {
                console.log("Hello!");
            },
            regex: /\w+/,
            nestedObjects: {
                obj1: {
                    a: 1,
                    b: 2
                },
                obj2: {
                    x: "foo",
                    y: "bar",
                    z: [1, 2, 3]
                }
            }
        });
        const testGUIDB = new TestGUID({
            name: "Alice",
            age: 25,
            address: {
                street: "123 Main St",
                city: "Anytown",
                zip: "12345"
            },
            hobbies: ["reading", "painting", "games"],
            birthday: new Date("1999-05-15"),
            greet: function () {
                console.log("Hello!");
            },
            regex: /\w+/,
            nestedObjects: {
                obj1: {
                    a: 1,
                    b: 2
                },
                obj2: {
                    x: "foo",
                    y: "bar",
                    z: [1, 2, 3]
                }
            }
        });
        expect(testGUIDA).not.toBe(testGUIDB);
    });
    it('should return a string representation of the guid', () => {
        const metadata = { Id: randomUUID() };
        const testGUID = new TestGUID(metadata);
        expect(testGUID.toString()).toBeInstanceOf(String);
    });
    it('should return an Id as a GUID type', () => {
        const metadata = { Id: randomUUID() };
        const testGUID = new TestGUID(metadata);
        expect(testGUID.Id).toBeInstanceOf(GUID);
    });
    it('should turn a guid string into a guid object.', () => {
        const metadata = 'a6305cb1-51fe-4883-922c-0ceb131de273';
        const testGUID = new TestGUID(metadata);
        expect(testGUID.Id).toBeInstanceOf(GUID);
    });
});