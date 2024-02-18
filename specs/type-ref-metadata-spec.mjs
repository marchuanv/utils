import { TypeReference } from '../lib/type-reference.mjs';
describe('when create type references', () => {
    let typeA_Id = null;
    let typeA = null;
    let error = null;
    beforeAll(() => {
        try {
            typeA = new TypeReference({ });
            ({ Id: typeA_Id } = typeA);
        } catch(err) {
            error = err;
        }
    });
    it('should raise an error if metadata does not have a valid namespace', () => {
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
        expect(error.message).toBe('namespace not found in metadata.')
    });
});