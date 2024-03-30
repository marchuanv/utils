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
class DogSchema extends Schema {
    constructor() {
        super([
            { name: 'kind', typeInfo: new TypeInfo({ type: String }) },
            { name: 'type', typeInfo: new TypeInfo({ type: Dog }) },
            { name: 'food', typeInfo: new TypeInfo({ type: Food }) }
        ]);
    }
}
class CatSchema extends Schema {
    constructor() {
        super([
            { name: 'kind', typeInfo: new TypeInfo({ type: String }) },
            { name: 'type', typeInfo: new TypeInfo({ type: Cat }) },
            { name: 'food', typeInfo: new TypeInfo({ type: Food }) }
        ]);
    }
}
class ComplexSchema extends Schema {
    constructor() {
        super([
            { name: 'name', typeInfo: new TypeInfo({ type: String }) },
            { name: 'age', typeInfo: new TypeInfo({ type: Number }) },
            { name: 'address', typeInfo: new TypeInfo({ type: Object }) },
            { name: 'hobbies', typeInfo: new TypeInfo({ type: Array }) },
            { name: 'birthday', typeInfo: new TypeInfo({ type: Date }) },
            { name: 'regex', typeInfo: new TypeInfo({ type: RegExp }) },
            { name: 'nestedObjects', typeInfo: new TypeInfo({ type:  Object }) }
        ]);
    }
}
class Cat { }
class Dog { }
describe('when constructing guids given data and/or a data schema', () => {
    it('should have equality between two guids having the same data', () => {
        let data = {  IdStr: randomUUID() };
        let testGUIDA = new GUID(data);
        let testGUIDB = new GUID(data);
        expect(testGUIDA).toBe(testGUIDB);
        expect(testGUIDA.toString()).toBe(testGUIDB.toString());
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should have not equality between two guids created without data', () => {
        let testGUIDA = new GUID();
        let testGUIDB = new GUID();
        expect(testGUIDA).not.toBe(testGUIDB);
    });
    it('should have equality between two guids having the same instance of a class', () => {
        const dog1 = new Animal('dog1', new Food('epol'), Dog);
        const dog2 = new Animal('dog1', new Food('epol'), Dog);
        const dogSchema = new DogSchema();
        const testGUIDA = new GUID(dog1, dogSchema);
        const testGUIDB = new GUID(dog2, dogSchema);
        expect(testGUIDA).toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should have equality between two guids having the same complex data', () => {
        const complexSchema = new ComplexSchema();
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
        }, complexSchema);
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
        }, complexSchema);
        expect(testGUIDA).toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should not have equality between two guids having different data', () => {
        const data1 = { IdStr: randomUUID() };
        const data2 = { IdStr: randomUUID() };
        const testGUIDA = new GUID(data1);
        const testGUIDB = new GUID(data2);
        expect(testGUIDA).not.toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should not have equality between two guids having different class data', () => {
        const dog = new Animal('dog2', new Food('epol'), Dog);
        const cat = new Animal('cat2', new Food('epol'), Cat);
        const dogSchema = new DogSchema();
        const catSchema = new CatSchema();
        const testGUIDA = new GUID(dog, dogSchema);
        const testGUIDB = new GUID(cat, catSchema );
        expect(testGUIDA).not.toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should NOT have equality between two guids having different complex data', () => {
        const complexSchema = new ComplexSchema();
        const testGUIDA = new GUID({
            name: "John",
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
        }, complexSchema);
        const testGUIDB = new GUID({
            name: "John",
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
        }, complexSchema);
        expect(testGUIDA).not.toBe(testGUIDB);
        testGUIDA.destroy();
        testGUIDB.destroy();
    });
    it('should return a string representation of the guid', () => {
        const data = { IdStr: randomUUID() };
        const testGUID = new GUID(data);
        expect(testGUID.toString()).toBeInstanceOf(String);
        testGUID.destroy();
    });
    it('should turn a guid string into a guid object.', () => {
        const data = 'a6305cb1-51fe-4883-922c-0ceb131de273';
        const testGUID = new GUID(data);
        expect(testGUID.toString()).toBe('a6305cb1-51fe-4883-922c-0ceb131de273');
        testGUID.destroy();
    });
});