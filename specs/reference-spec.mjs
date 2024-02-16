import { Reference } from '../registry.mjs';
describe('when finding references', () => {
    let A_Id = null;
    let B_Id = null;
    let C_Id = null;
    let A = null;
    let B = null;
    let C = null;
    beforeAll(() => {
        A = Reference.create();
        ({ Id: A_Id } = A);
        {
            B = Reference.create(A_Id);
            ({ Id: B_Id } = B);
        }
        {
            C = Reference.create(B_Id);
            ({ Id: C_Id } = C);
        }
    });
    it('B should reference A', () => {
        const isRef = B.references(Id => Id === A_Id);
        expect(isRef).toBeDefined();
        expect(isRef).not.toBeNull();
        expect(isRef).toBeTrue();
    });
    it('A should reference B', () => {
        const isRef = A.references(Id => Id === B_Id);
        expect(isRef).toBeDefined();
        expect(isRef).not.toBeNull();
        expect(isRef).toBeTrue();
    });
    it('B should reference C', () => {
        const isRef = B.references(Id => Id === C_Id);
        expect(isRef).toBeDefined();
        expect(isRef).not.toBeNull();
        expect(isRef).toBeTrue();
    });
    it('C should reference B', () => {
        const isRef = C.references(Id => Id === B_Id);
        expect(isRef).toBeDefined();
        expect(isRef).not.toBeNull();
        expect(isRef).toBeTrue();
    });
    it('should enumerate all references', () => {
        let Ids = [];
        while (Reference.next) {
            Ids.push(Reference.current);
        }
        expect(Ids).toBeDefined();
        expect(Ids).not.toBeNull();
        expect(Ids.length).toBe(3);
    });
});