import { GUID, Reference } from '../registry.mjs';
describe('when reference', () => {
    it('should', () => {
        const refA = Reference.create();
        const refB = Reference.create(refA.Id);
        const ref = refB.find(({ Id }) => Id === refA.Id);
        expect(ref).toBeDefined();
        expect(ref).not.toBeNull();
        expect(ref.Id).toBe(refA.Id);
    });
});