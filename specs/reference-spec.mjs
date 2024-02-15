import { Reference } from '../registry.mjs';
describe('when reference', () => {
    it('should', () => {
        const { Id, refId } = new Reference();
        const foundRefId = Reference.get(Id);
        expect(foundRefId).toBeDefined();
        expect(foundRefId).not.toBeNull();
        expect(foundRefId).toBe(refId);
    });
});