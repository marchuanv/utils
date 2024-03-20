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
describe('when checking if a type is primitive', () => {
    it('should return true', () => {
        for (const { type, name } of Reflection.getPrimitiveTypes()) {
            try {
                let results = Reflection.isPrimitiveType(type);
                expect(results).toBeTrue();
                results = Reflection.isPrimitiveType(name);
                expect(results).toBeTrue();
            } catch (error) {
                console.log(error);
                fail(`did not expected any errors for ${name}`);
            }
        }
    });
});
describe('when getting a class property', () => {
    it('should return the property if found', () => {
        try {
            const property = Reflection.getClassProperty(PropertyTypeTest, 'name');
            expect(property).toBeDefined();
            expect(property).not.toBeNull();
        } catch (error) {
            console.log(error);
            fail(`did not expected any errors`);
        }
    });
});
describe('when getting a class property given resolving the property type', () => {
    it('should return the property with a propertyType', () => {
        try {
            const beforeConditions = [
                { order: 1, variable: 'super\\.' },
                { order: 2, variable: '(get|set)' },
                { order: 3, variable: '\\(\\{name\\:null\\}\\,' },
            ];
            const afterConditions = [
                { order: 2, variable: '\\)' },
            ];
            const property = Reflection.getClassProperty(PropertyTypeTest, 'name', beforeConditions, afterConditions);
            expect(property).toBeDefined();
            expect(property).not.toBeNull();
            if (property) {
                expect(property.propertyType).toBeDefined();
                expect(property.propertyType).not.toBeNull();
            }
        } catch (error) {
            console.log(error);
            fail(`did not expected any errors`);
        }
    });
});
describe('when matching types', () => {
    fit('should return true for classes', () => {
        try {
            let isMatch = Reflection.typeMatch(RootClass, RootClass);
            expect(isMatch).toBeTrue();
            isMatch = Reflection.typeMatch(RootClass, ExtendedClass);
            expect(isMatch).toBeTrue();

            isMatch = Reflection.typeMatch(RootClass.prototype, ExtendedClass.prototype);
            expect(isMatch).toBeTrue();

            isMatch = Reflection.typeMatch(RootClass, ExtendedClass.prototype);
            expect(isMatch).toBeTrue();
            isMatch = Reflection.typeMatch(RootClass.prototype, ExtendedClass);
            expect(isMatch).toBeTrue();

            isMatch = Reflection.typeMatch(Object, Object.prototype);
            expect(isMatch).toBeTrue();
            isMatch = Reflection.typeMatch(Object.prototype, Object);
            expect(isMatch).toBeTrue();

            isMatch = Reflection.typeMatch(null, undefined);
            expect(isMatch).toBeFalse();
            isMatch = Reflection.typeMatch(undefined, null);
            expect(isMatch).toBeFalse();

            isMatch = Reflection.typeMatch(undefined, null);
            expect(isMatch).toBeFalse();
            isMatch = Reflection.typeMatch(null, undefined);
            expect(isMatch).toBeFalse();

            isMatch = Reflection.typeMatch(undefined, undefined);
            expect(isMatch).toBeTrue();
            isMatch = Reflection.typeMatch(null, null);
            expect(isMatch).toBeTrue();

        } catch (error) {
            console.log(error);
            fail(`did not expected any errors`);
        }
    });
});
class RootClass { }
class ExtendedClass extends RootClass { }
class PropertyTypeTest {
    get name() {
        return super.get({ name: null }, String);
    }
}