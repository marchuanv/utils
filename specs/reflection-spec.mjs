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
fdescribe('when checking if an object is of one or more types', () => {
    it('should return true if a string', () => {
        const results = Reflection.isTypeOf('this is a function', String);
        expect(results).toBeTrue();
    });
    it('should return true if a number', () => {
        const results = Reflection.isTypeOf(1, Number);
        expect(results).toBeTrue();
    });
    it('should return true if a big int', () => {
        const results = Reflection.isTypeOf(BigInt(1), BigInt);
        expect(results).toBeTrue();
    });
    it('should return true if it is a function', () => {
        const results = Reflection.isTypeOf(() => { }, Function);
        expect(results).toBeTrue();
    });
    it('should return true if it is an object', () => {
        const results = Reflection.isTypeOf({ message: 'test' }, Object);
        expect(results).toBeTrue();
    });
    it('should return true if instance of Cat class', () => {
        class Cat { }
        const results = Reflection.isTypeOf(new Cat(), Cat);
        expect(results).toBeTrue();
    });
    it('should return true if instance of Cat class is an Animal', () => {
        class Animal { }
        class Cat extends Animal { }
        const results = Reflection.isTypeOf(new Cat(), Animal);
        expect(results).toBeTrue();
    });
    it('should return true type Cat class is Cat class', () => {
        class Cat { }
        const results = Reflection.isTypeOf(Cat, Cat);
        expect(results).toBeTrue();
    });
    it('should return true type Cat class extends Animal', () => {
        class Biological { }
        class Animal extends Biological { }
        class Cat extends Animal { }
        const results = Reflection.isTypeOf(Cat, [ Animal, Biological ]);
        expect(results).toBeTrue();
    });
});
class RootClass { }
class ExtendedClass extends RootClass { }