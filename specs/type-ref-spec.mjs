import { TypeReference } from '../lib/type-reference.mjs';
describe('when create type references', () => {
    let typeA_Id = null;
    let typeB_Id = null;
    let typeA = null;
    let typeB = null;
    beforeAll(() => {
        typeA = new TypeReference({ namespace: 'component.classA' });
        ({ Id: typeA_Id } = typeA);
        typeB = new TypeReference({ namespace: 'component.classB' });
        ({ Id: typeB_Id } = typeB);
    });
    it('should have correct namespace for component class A', () => {
        expect(typeA).toBeDefined();
        expect(typeA).not.toBeNull();
        expect(typeA.metadata).toBeDefined();
        expect(typeA.metadata).not.toBeNull();
        expect(typeA.metadata.namespace).toBe('component.classA');
    });
    it('should have correct namespace for component class B', () => {
        expect(typeB).toBeDefined();
        expect(typeB).not.toBeNull();
        expect(typeB.metadata).toBeDefined();
        expect(typeB.metadata).not.toBeNull();
        expect(typeB.metadata.namespace).toBe('component.classB');
    });
});