import {  TypeInfoSchema } from '../../registry.mjs';
class Cat { meow() { } get colour() { } get name() { } };
class CatSchema extends TypeInfoSchema { };
describe('when creating cat type info given a cat schema', () => {
    fit('should .', () => {
        try {
            const catSchema = new CatSchema(Cat);
            expect(catSchema.defaultValue).toBeInstanceOf(Cat);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('The name and func arguments are null.');
        }
    });
});