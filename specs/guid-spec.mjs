import { GUID } from '../registry.mjs';
describe('when creating a guid given metadata', () => {
    it('should create an valid guid representing the metadata', () => {
        const id = new GUID('components');
        const id2 = new GUID('components');
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id.toString()).toEqual(id2.toString());
    });
});