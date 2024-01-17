import { GUID, TypeDefinition } from "../registry.mjs";
import { ClassA } from './classes/classA.mjs';
import { ClassB } from './classes/classB.mjs';
import { Dog } from './classes/dog.mjs';
import { Food } from './classes/food.mjs';
describe('when mapping types', () => {
    fit('should register and find classA', () => {

        const foundByClass = TypeDefinition.find({ type: ClassA });
        const foundByName = TypeDefinition.find({ typeName: ClassA.name });

        expect(foundByClass).toBeDefined();
        expect(foundByName).toBeDefined();

        expect(foundByClass).not.toBeNull();
        expect(foundByName).not.toBeNull();

        expect(foundByClass.isObject).toBeFalse();
        expect(foundByName.isObject).toBeFalse();
    });
    it('should register and find ClassB', () => {
        const classId = new GUID();
        const referenceTypeById = TypeMapper.getReferenceType(classId);
        const referenceTypeByClass = TypeMapper.getReferenceType(ClassB);
        const referenceTypeByClassName = TypeMapper.getReferenceType(ClassB.name);

        expect(referenceTypeById).toBeDefined();
        expect(referenceTypeByClass).toBeDefined();
        expect(referenceTypeByClassName).toBeDefined();

        expect(referenceTypeById).not.toBeNull();
        expect(referenceTypeByClass).not.toBeNull();
        expect(referenceTypeByClassName).not.toBeNull();

        expect(referenceTypeById.isArray).toBeFalse();
        expect(referenceTypeByClass.isArray).toBeFalse();
        expect(referenceTypeByClassName.isArray).toBeFalse();

        expect(referenceTypeById.isObject).toBeTrue();
        expect(referenceTypeByClass.isObject).toBeTrue();
        expect(referenceTypeByClassName.isObject).toBeTrue();
    });
    it('should register and find Dog', () => {
        const classId = new GUID();
        const referenceTypeById = TypeMapper.getReferenceType(classId);
        const referenceTypeByClass = TypeMapper.getReferenceType(Dog);
        const referenceTypeByClassName = TypeMapper.getReferenceType(Dog.name);

        expect(referenceTypeById).toBeDefined();
        expect(referenceTypeByClass).toBeDefined();
        expect(referenceTypeByClassName).toBeDefined();

        expect(referenceTypeById).not.toBeNull();
        expect(referenceTypeByClass).not.toBeNull();
        expect(referenceTypeByClassName).not.toBeNull();

        expect(referenceTypeById.isArray).toBeFalse();
        expect(referenceTypeByClass.isArray).toBeFalse();
        expect(referenceTypeByClassName.isArray).toBeFalse();

        expect(referenceTypeById.isObject).toBeTrue();
        expect(referenceTypeByClass.isObject).toBeTrue();
        expect(referenceTypeByClassName.isObject).toBeTrue();
    });
    it('should register and find Food', () => {
        const classId = new GUID();
        const referenceTypeById = TypeMapper.getReferenceType(classId);
        const referenceTypeByClass = TypeMapper.getReferenceType(Food);
        const referenceTypeByClassName = TypeMapper.getReferenceType(Food.name);

        expect(referenceTypeById).toBeDefined();
        expect(referenceTypeByClass).toBeDefined();
        expect(referenceTypeByClassName).toBeDefined();

        expect(referenceTypeById).not.toBeNull();
        expect(referenceTypeByClass).not.toBeNull();
        expect(referenceTypeByClassName).not.toBeNull();

        expect(referenceTypeById.isArray).toBeFalse();
        expect(referenceTypeByClass.isArray).toBeFalse();
        expect(referenceTypeByClassName.isArray).toBeFalse();

        expect(referenceTypeById.isObject).toBeTrue();
        expect(referenceTypeByClass.isObject).toBeTrue();
        expect(referenceTypeByClassName.isObject).toBeTrue();
    });
    it('should register a class as an array', () => {
        const classId = new GUID();
        TypeMapper.register(classId, Food, true);
        const referenceTypeById = TypeMapper.getReferenceType(classId);
        const referenceTypeByClass = TypeMapper.getReferenceType(ClassRefTypeAsArray);

        expect(referenceTypeById).toBeDefined();
        expect(referenceTypeByClass).toBeDefined();

        expect(referenceTypeById).not.toBeNull();
        expect(referenceTypeByClass).not.toBeNull();

        expect(referenceTypeById.isArray).toBeTrue();
        expect(referenceTypeByClass.isArray).toBeTrue();

        expect(referenceTypeById.isObject).toBeFalse();
        expect(referenceTypeByClass.isObject).toBeFalse();
    });
    it('should NOT register an array', () => {
        let error = null;
        try {
            const classId = new GUID();
            TypeMapper.register(classId, Array);
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
    });
    it('should NOT register an object', () => {
        let error = null;
        try {
            const classId = new GUID();
            TypeMapper.register(classId, Object);
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
    });
});