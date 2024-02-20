import { getUuid } from '../registry.mjs';
describe('when ', () => {
    it('should ', () => {
        const id = getUuid('components');
        const id2 = getUuid('components');
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).toBe(id2);
    });
});