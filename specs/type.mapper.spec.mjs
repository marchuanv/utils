import { GUID, TypeMapper } from "../registry.mjs";
describe('when mapping types', () => {
    it('should register a class reference type', () => {
        const classId = new GUID();
        TypeMapper.register(classId, ClassRefType);
        const referenceTypeById = TypeMapper.getReferenceType(classId);
        const referenceTypeByClass = TypeMapper.getReferenceType(ClassRefType);

        expect(referenceTypeById).toBeDefined();
        expect(referenceTypeByClass).toBeDefined();

        expect(referenceTypeById).not.toBeNull();
        expect(referenceTypeByClass).not.toBeNull();

        expect(referenceTypeById.isArray).toBeFalse();
        expect(referenceTypeByClass.isArray).toBeFalse();

        expect(referenceTypeById.isObject).toBeTrue();
        expect(referenceTypeByClass.isObject).toBeTrue();
    });
    it('should register a class as an array', () => {
        const classId = new GUID();
        TypeMapper.register(classId, ClassRefTypeAsArray, true);
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
        } catch(err) {
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
        } catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
    });
});

class ClassRefType {
    constructor() {
    }
}

class ClassRefTypeAsArray {
    constructor() {
    }
}