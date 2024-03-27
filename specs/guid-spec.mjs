import { GUID, Schema, TypeInfo, randomUUID } from '../registry.mjs';
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
describe('when constructing guids given metadata', () => {
    it('should have equality between two guids having the same metadata', () => {
        let metadata = { Id: randomUUID() };
        let testGUIDA = new GUID(metadata);
        let testGUIDB = new GUID(metadata);
        expect(testGUIDA).toBe(testGUIDB);
        metadata = randomUUID();
        testGUIDA = new GUID(metadata);
        testGUIDB = new GUID(metadata);
        expect(testGUIDA.toString()).toBe(testGUIDB.toString());
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should have not equality between two guids created without metadata', () => {
        let testGUIDA = new GUID();
        let testGUIDB = new GUID();
        expect(testGUIDA).not.toBe(testGUIDB);
    });
    it('should have equality between two guids having the same class metadata', () => {
        const dog1 = new Animal('dog', new Food('epol'), Dog);
        const dog2 = new Animal('dog', new Food('epol'), Dog);
        const testGUIDA = new GUID(dog1);
        const testGUIDB = new GUID(dog2);
        expect(testGUIDA).toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should have equality between two guids having the same complex metadata', () => {
        const testGUIDA = new GUID({
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
        const testGUIDB = new GUID({
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
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should not have equality between two guids having different metadata', () => {
        const metadata1 = { Id: randomUUID() };
        const metadata2 = { Id: randomUUID() };
        const testGUIDA = new GUID(metadata1);
        const testGUIDB = new GUID(metadata2);
        expect(testGUIDA).not.toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should not have equality between two guids having different class metadata', () => {
        const dog1 = new Animal('dog', new Food('epol'), Dog);
        const dog2 = new Animal('dog', new Food('epol'), Cat);
        const testGUIDA = new GUID(dog1);
        const testGUIDB = new GUID(dog2);
        expect(testGUIDA).not.toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should not have equality between two guids having different complex metadata', () => {
        const testGUIDA = new GUID({
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
        const testGUIDB = new GUID({
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
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should not have equality between two guids having different array metadata', () => {

        class TestSchemaA extends Schema {
            constructor(properties = []) {
                super(properties.concat([{ key: 'key1', type: new TypeInfo({ type: String }) }]));
            }
        }
        class TestSchemaB extends Schema {
            constructor(properties = []) {
                super(properties.concat([{ key: 'key2', type: new TypeInfo({ type: String }) }]));
            }
        }

        const schemaA = new TestSchemaA();
        const schemaB = new TestSchemaB();

        const testGUIDA = new GUID({ Id: '7ef3fda1-a2c3-418e-893f-e47b7579f111', schemaA });
        const testGUIDB = new GUID({ Id: '7ef3fda1-a2c3-418e-893f-e47b7579f111', schemaB });
        expect(testGUIDA).not.toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should return a string representation of the guid', () => {
        const metadata = { Id: randomUUID() };
        const testGUID = new GUID(metadata);
        expect(testGUID.toString()).toBeInstanceOf(String);
        testGUID.destroy();
    });
    it('should turn a guid string into a guid object.', () => {
        const metadata = 'a6305cb1-51fe-4883-922c-0ceb131de273';
        const testGUID = new GUID(metadata);
        expect(testGUID.toString()).toBe('a6305cb1-51fe-4883-922c-0ceb131de273');
        testGUID.destroy();
    });
});