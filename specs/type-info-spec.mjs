import { GUID, SecureContext, TypeInfo } from '../registry.mjs';
describe('when creating type info', () => {
    const invalidNameAndTypeErrorMessage = 'The info.name is null, undefined, not a string, empty string or unknown, and the info.type is null, undefined, not a function or unknown.';
    it('should raise an error if the info argument is undefined', () => {
        try {
            new TypeInfo(undefined);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(invalidNameAndTypeErrorMessage);
        }
    });
    it('should raise an error if the info argument is null', () => {
        try {
            new TypeInfo(null);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('The info argument is null, undefined or not an object.');
        }
    });
    it('should raise an error if the info type is not a function', () => {
        try {
            new TypeInfo({ type: '' });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(invalidNameAndTypeErrorMessage);
        }
    });
    it('should raise an error if the info name is not a string', () => {
        try {
            new TypeInfo({ name: String });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(invalidNameAndTypeErrorMessage);
        }
    });
    it('should raise an error if both info name and type is null.', () => {
        try {
            new TypeInfo({ name: null, type: null });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(invalidNameAndTypeErrorMessage);
        }
    });
    it('should raise an error if both info name and type is undefined.', () => {
        try {
            new TypeInfo({ name: undefined, type: undefined });
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(invalidNameAndTypeErrorMessage);
        }
    });
    it('should NOT raise an error if info name is null and type is a class.', () => {
        try {
            class SomeDog { bark() { } get colour() { } };
            const type = new TypeInfo({ name: undefined, type: SomeDog });
            expect(type.members.length).toBeGreaterThan(0);
        } catch (error) {
            console.log(error);
            fail('did not expected any errors');
        }
    });
    it('should NOT raise an error if info name is null and type is a valid.', () => {
        try {
            new TypeInfo({ name: undefined, type: String });
        } catch (error) {
            console.log(error);
            fail('did not expected any errors');
        }
    });
    it('should NOT raise an error if info name is valid and type is not valid.', () => {
        try {
            new TypeInfo({ name: 'string', type: undefined });
        } catch (error) {
            console.log(error);
            fail('did not expected any errors');
        }
    });
    it('should not run all the validations if the type has been created before and an type info id is available.', () => {
        try {
            const typeInfo = new TypeInfo({ name: 'number', type: Number });
            const typeInfoExist = TypeInfo.get(typeInfo.Id);
            expect(typeInfo).toBe(typeInfoExist);
        } catch (error) {
            console.log(error);
            fail('did not expected any errors');
        }
    });
    it('should not match if the wrong type info is provided.', () => {
        const secureContext = new SecureContext();
        const guid = (new GUID(secureContext)).toString();
        try {
            TypeInfo.get(guid);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`${guid} not found.`);
        }
    });
});