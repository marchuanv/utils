import { GUID } from '../registry.mjs';
describe('when creating a guid given metadata', () => {
    it('should compare and equal two guids representing the same metadata', () => {
        const id = new GUID({ hello: "hello world" });
        const id2 = new GUID({ hello: "hello world" });
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).toBe(id2);
    });
    it('should compare and equal two guids representing different metadata', () => {
        const id = new GUID({ hello: "hello world" });
        const id2 = new GUID({ hello: "hello world again" });
        expect(id).toBeDefined();
        expect(id).not.toBeNull();
        expect(id2).toBeDefined();
        expect(id2).not.toBeNull();
        expect(id).not.toBe(id2);
    });
});