import { Reflection } from '../registry.mjs';
class SomeClass { }
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
describe('when checking if a string is empty', () => {
    it('should return true', () => {
        let results = Reflection.isEmptyString('   ');
        expect(results).toBeTrue();
        results = Reflection.isEmptyString('');
        expect(results).toBeTrue();
    });
    it('should return false', () => {
        const results = Reflection.isEmptyString('Not Empty');
        expect(results).toBeFalse();
    });
});
describe('when checking if an obj is a class', () => {
    it('should return false if a string', () => {
        let results = Reflection.isClass('');
        expect(results).toBeFalse();
    });
    it('should return true if a class', () => {
        let results = Reflection.isClass(SomeClass);
        expect(results).toBeTrue();
    });
    it('should return true if am instance of a class', () => {
        const instance = new SomeClass();
        let results = Reflection.isClass(instance);
        expect(results).toBeTrue();
    });
});
fdescribe('when checking if a function is of one or more types', () => {
    it('should return true if a string', () => {
        const func = 'this is a function';
        const results = Reflection.isTypeOf(func, String);
        expect(results).toBeTrue();
    });
    it('should return true if it is a function', () => {
        const func = () => { };
        const results = Reflection.isTypeOf(func, Function);
        expect(results).toBeTrue();
    });
});
class RootClass { }
class ExtendedClass extends RootClass { }