import { Schema, TypeInfo } from '../registry.mjs';
describe('when creating a schema', () => {
    const expectedErrorMessage = 'The properties argument is null, undefined, not an array, an empty array or contains invalid elements.';
    it('should raise an error if targeting schema directly', () => {
        try {
            new Schema();
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('Schema is an abstract class.');
        }
    });
    it('should raise an error if the properties argument is null', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema(null);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
    });
    it('should raise an error if the properties argument is undefined', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema();
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
    });
    it('should raise an error if the properties argument is not an array', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema({});
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
    });
    it('should raise an error if the properties argument is an empty array', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema([]);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
    });
    it('should raise an error if the properties argument is array with invalid elements', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema([{}]);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
        try {
            new TestSchema([{ invalidProp: '' }]);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
        try {
            new TestSchema([{ name: String, typeInfo: {} }]);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
    });
    it('should raise an error when validating and undefined is passed for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate(undefined);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`The verify argument is null, undefined or not an object.`);
        }
    });
    it('should raise an error when validating and null is passed for verification.', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate(null);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`The verify argument is null, undefined or not an object.`);
        }
    });
    it('should raise an error when validating and a string is passed for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate('awdwad');
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`The verify argument is null, undefined or not an object.`);
        }
    });
    it('should raise an error when validating and a number is passed for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate(0);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`The verify argument is null, undefined or not an object.`);
        }
    });
    it('should raise an error when validating and an empty object is passed for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate({});
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`obj to verify is null, undefined or not an object.`);
        }
    });
    it('should raise an error when validating and only a key is passed for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate({ key: 'somekey ' });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`obj to verify is null, undefined or not an object.`);
        }
    });
    it('should raise an error when validating and an obj with no properties are passed for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate({ obj: {} });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`obj to verify does not have any properties.`);
        }
    });
    it('should NOT raise an error if the properties argument is array with valid elements', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should NOT raise an error when validating and passing an obj with properties for verification', () => {
        class TestSchema extends Schema { }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: String }) }]);
            schema.validate({ obj: { somekey: 'a string' } });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should NOT raise an error when validating and passing a key and/or an obj with properties for verification', () => {
        class TestSchema extends Schema { }
        class Addresses extends Array {
            constructor() {
                super();
                super.push('Vause Road');
            }
        }
        try {
            const schema = new TestSchema([{ name: 'somekey', typeInfo: new TypeInfo({ type: Object }) }]);
            schema.validate({ key: 'somekey', obj: { somekey: { message: 'Hello World' } } });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
        try {
            const schema = new TestSchema([{ name: 'addresses', typeInfo: new TypeInfo({ type: Array }) }]);
            schema.validate({ obj: { addresses: ['Vause Road'] } });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
        try {
            const schema = new TestSchema([{ name: 'addresses', typeInfo: new TypeInfo({ type: Array }) }]);
            schema.validate({ key: 'addresses', obj: { addresses: ['Vause Road'] } });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
        try {
            const schema = new TestSchema([{ name: 'addresses', typeInfo: new TypeInfo({ type: Addresses }) }]);
            schema.validate({ key: 'addresses', obj: { addresses: new Addresses() } });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
        try {
            const schema = new TestSchema([{ name: 'addresses', typeInfo: new TypeInfo({ type: Addresses }) }]);
            schema.validate({ obj: { addresses: new Addresses() } });
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
});