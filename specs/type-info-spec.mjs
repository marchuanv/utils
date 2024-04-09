import { Type, TypeInfo, TypeInfoSchema } from '../registry.mjs';
describe('when creating type info', () => {
    it('should raise an error if the type name and function is null.', () => {
        class Cat {
            meow() { }
            get colour() { }
            get name() { }
        };
        class CatTypeInfoSchema extends TypeInfoSchema {
            constructor() {
                super(null);
            }
        }
        try {
            const type = new CatTypeInfoSchema();
            new TypeInfo(type);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('The name and func arguments are null.');
        }
    });
    it('should raise an error if the type is unknown.', () => {
        try {
            const type = new Type();
            new TypeInfo(type);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('type is unknown.');
        }
    });
    it('should NOT raise an error if the type is a class.', () => {
        class Dog {
            bark() { }
            get colour() { }
            get name() { }
        };
        class DogTypeInfoSchema extends TypeInfoSchema { }
        try {
            const typeInfoSchema = new DogTypeInfoSchema(Dog);
            expect(typeInfoSchema.members.length).toBeGreaterThan(0);
        } catch (error) {
            console.log(error);
            fail('did not expected any errors');
        }
    });
    it('should raise an error if targeting schema directly', () => {
        try {
            new Schema();
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('Schema is an abstract class.');
        }
    });
    it('should raise an error if the schema does not have any properties', () => {
        class NoPropTestSchema extends Schema { }
        try {
            const testSchema = new NoPropTestSchema();
            testSchema.validate({
                message: 'something'
            });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('NoPropTestSchema does not have any properties.');
        }
    });
    it('should raise an error when validating and undefined is passed for verification', () => {
        class TestSchemaA extends Schema {
            get message() {
                return new TypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaA();
            schema.validate(undefined);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`data to validate is null, undefined, not an object or an empty object.`);
        }
    });
    it('should raise an error when validating and null is passed for verification.', () => {
        class TestSchemaB extends Schema {
            get message() {
                return new TypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaB();
            schema.validate(null);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`data to validate is null, undefined, not an object or an empty object.`);
        }
    });
    it('should raise an error when validating and a string is passed for verification', () => {
        class TestSchemaC extends Schema {
            get message() {
                return new TypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaC();
            schema.validate('awdwad');
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`data to validate is null, undefined, not an object or an empty object.`);
        }
    });
    it('should raise an error when validating and a number is passed for verification', () => {
        class TestSchemaD extends Schema {
            get message() {
                return new TypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaD();
            schema.validate(0);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`data to validate is null, undefined, not an object or an empty object.`);
        }
    });
    it('should raise an error when validating and an empty object is passed for verification', () => {
        class TestSchemaE extends Schema {
            get message() {
                return new TypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaE();
            schema.validate({});
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`data to validate is null, undefined, not an object or an empty object.`);
        }
    });
    it('should NOT raise an error when validating and passing an obj with properties for verification', () => {
        class TestSchemaF extends Schema {
            get name() {
                return new TypeInfoSchema(String);
            }
            get surname() {
                return new TypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaF();
            schema.validate({ name: 'Joe', surname: 'Blogs', addresses: ['24 Romsey Grove', '173b Vaus Road'] });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    fit('should create an empty object from a schema', () => {
        class StringTypeInfoSchema extends TypeInfoSchema {
            constructor() {
                super(String);
            }
        }
        class TestG {
            get name() { }
            get surname() { }
        }
        class TestSchemaG extends TypeInfoSchema {
            get name() {
                return new StringTypeInfoSchema(String);
            }
            get surname() {
                return new StringTypeInfoSchema(String);
            }
        }
        try {
            const schema = new TestSchemaG(TestG);
            const data = schema.default;
            schema.validate(data);
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should create string type info without error.', () => {
        class StringTypeSchema extends TypeInfoSchema {
            constructor() {
                super(String);
            }
        }
        try {
            new StringTypeSchema();
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should create boolean type info without error', () => {
        class BooleanTypeSchema extends TypeInfoSchema {
            constructor() {
                super(Boolean);
            }
        }
        try {
            new BooleanTypeSchema();
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
});