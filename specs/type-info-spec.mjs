import { Type, TypeInfo } from '../registry.mjs';
describe('when creating type info', () => {
    it('should raise an error if the type name and function is null.', () => {
        try {
            const type = new Type(null, null);
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
        try {
            class SomeDog { bark() { } get colour() { } };
            const type = new Type(null, SomeDog);
            const typeInfo = new TypeInfo(type);
            expect(typeInfo.members.length).toBeGreaterThan(0);
        } catch (error) {
            console.log(error);
            fail('did not expected any errors');
        }
    });
});