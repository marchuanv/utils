import { Reflection } from '../registry.mjs';
describe('when getting extended classes', () => {
    it('should return only classes', () => {
        const classes = Reflection.getExtendedClasses(ExtendedClass);
        expect(classes[0]).toBe(RootClass);
        expect(classes[1]).toBe(ExtendedClass);
    });
});
describe('when getting extended prototypes', () => {
    it('should return every prototype', () => {
        const prototypes = Reflection.getPrototypes(ExtendedClass);
        const type = typeof prototypes[0];
        expect(type).toBe('function');
        expect(prototypes[1]).toBe(RootClass);
        expect(prototypes[2]).toBe(ExtendedClass);
    });
});
class RootClass { }
class ExtendedClass extends RootClass { }