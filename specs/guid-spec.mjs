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
        const metadata = { Id: randomUUID() };
        const id = new TestGUID(metadata);
        const id2 = new TestGUID(metadata);
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).toBe(id2);
    });
    it('should have equality between two guids having the same class metadata', () => {
        const dog1 = new Animal('dog', new Food('epol'), Dog);
        const dog2 = new Animal('dog', new Food('epol'), Dog);
        const id = new TestGUID(dog1);
        const id2 = new TestGUID(dog2);
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).toBe(id2);
    });
    it('should have equality between two guids having the same complex metadata', () => {
        const id = new TestGUID({
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
        const id2 = new TestGUID({
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
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).toBe(id2);
    });
    it('should not have equality between two guids having different metadata', () => {
        const metadata1 = { Id: randomUUID() };
        const metadata2 = { Id: randomUUID() };
        const id = new TestGUID(metadata1);
        const id2 = new TestGUID(metadata2);
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).not.toBe(id2);
    });
    it('should not have equality between two guids having different class metadata', () => {
        const dog1 = new Animal('dog', new Food('epol'), Dog);
        const dog2 = new Animal('dog', new Food('epol'), Cat);
        const id = new TestGUID(dog1);
        const id2 = new TestGUID(dog2);
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).not.toBe(id2);
    });
    it('should not have equality between two guids having different complex metadata', () => {
        const id = new TestGUID({
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
        const id2 = new TestGUID({
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
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).not.toBe(id2);
    });
    it('should return a string representation of the guid', () => {
        const metadata = { Id: randomUUID() };
        const id = new TestGUID(metadata);
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id.toString()).toBeInstanceOf(String);
    });
});