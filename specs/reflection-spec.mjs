import { Reflection } from '../registry.mjs';
class SomeClass { }
const primitiveTypes = [
    String,
    Boolean,
    BigInt,
    Number,
    null,
    Array,
    Object
];
const primitiveStringTypes = [
    'String',
    'Boolean',
    'BigInt',
    'Number',
    'null',
    'Array',
    'Object'
];
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
describe('when checking if a type is primitive', () => {
    it('should return true', () => {
        for (const _type of primitiveTypes) {
            try {
                const results = Reflection.isPrimitiveType(_type);
                expect(results).toBeTrue();
            } catch (error) {
                console.log(error);
                fail(`did not expected any errors for ${_type.name}`);
            }
        }
    });
});
describe('when checking if a type string is primitive', () => {
    it('should return true', () => {
        for (const _typeStr of primitiveStringTypes) {
            try {
                const results = Reflection.isPrimitiveType(_typeStr);
                expect(results).toBeTrue();
            } catch (error) {
                console.log(error);
                fail(`did not expected any errors for ${_typeStr}`);
            }
        }
    });
});
class RootClass { }
class ExtendedClass extends RootClass { }