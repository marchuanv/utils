import { Schema } from '../registry.mjs';
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
            new TestSchema([{ key: String, type: {} }]);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(expectedErrorMessage);
        }
    });
    it('should NOT raise an error if the properties argument is array with valid elements', () => {
        class TestSchema extends Schema { }
        try {
            new TestSchema([{ key: 'somekey', type: String }]);
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
});