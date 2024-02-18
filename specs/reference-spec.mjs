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

    it('should return an iterator over all references excluding the root', () => {
        const referenceIds = Array.from(Reference.nextReference()).map(ref => ref.toString());
        console.log('Reference IDs:', referenceIds);
        expect(referenceIds).toContain(B_Id.toString());
        expect(referenceIds).toContain(C_Id.toString());
        expect(referenceIds.length).toBe(2);
    });
});