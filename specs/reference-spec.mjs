import { Reference } from '../registry.mjs';

describe('when finding references', () => {
    let A_Id = null;
    let B_Id = null;
    let C_Id = null;
    let A = null;
    let B = null;
    let C = null;

    beforeAll(() => {
        A = new Reference();
        ({ Id: A_Id } = A);
        A.metadata.isRoot = true;

        B = new Reference(A_Id);
        ({ Id: B_Id } = B);

        C = new Reference(B_Id);
        ({ Id: C_Id } = C);
    });

    it('B should reference A', () => {
        const isRef = B.isAssociatedWith(A_Id);
        expect(isRef).toBeTrue();
    });

    it('A should reference B', () => {
        const isRef = A.isAssociatedWith(B_Id);
        expect(isRef).toBeTrue();
    });

    it('B should reference C', () => {
        const isRef = B.isAssociatedWith(C_Id);
        expect(isRef).toBeTrue();
    });

    it('C should reference B', () => {
        const isRef = C.isAssociatedWith(B_Id);
        expect(isRef).toBeTrue();
    });

    it('should have metadata', () => {
        const references = Array.from(Reference.nextRef());
        const allMetadata = references.filter(ref => ref.metadata);
        expect(allMetadata.length).toBe(references.length);
    });

    it('should return an iterator over all references including the root', () => {
        const references = Array.from(Reference.nextRef());
        const hasRoot = references.some(ref => ref.metadata.isRoot);
        expect(hasRoot).toBeTrue();
        const referenceIds = references.map(ref => ref.Id.toString());
        expect(referenceIds).toContain(A_Id.toString());
        expect(referenceIds).toContain(B_Id.toString());
        expect(referenceIds).toContain(C_Id.toString());
        expect(referenceIds.length).toBe(3);
    });
});