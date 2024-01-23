import { Animal, Dog, Food, TypeDefinition } from "../registry.mjs";
describe('when mapping types', () => {
    it('should register and find the Dog, Food and Animal classes', () => {
        for (const Class of [Animal, Dog, Food]) {
            const foundByClass = TypeDefinition.find({ type: Class });
            const foundByName = TypeDefinition.find({ typeName: Class.name });
            expect(foundByClass).toBeDefined();
            expect(foundByName).toBeDefined();
            expect(foundByClass).not.toBeNull();
            expect(foundByName).not.toBeNull();
            expect(foundByClass.isObject).toBeFalse();
            expect(foundByName.isObject).toBeFalse();
        }
    });
    it('should register a class as an array', () => {

        const foundByClass = TypeDefinition.find({ type: Array });
        const foundByName = TypeDefinition.find({ typeName: Array.name });

        expect(foundByClass).toBeDefined();
        expect(foundByName).toBeDefined();

        expect(foundByClass).not.toBeNull();
        expect(foundByName).not.toBeNull();

        expect(foundByClass.isObject).toBeFalse();
        expect(foundByName.isObject).toBeFalse();

        expect(foundByClass.isArray).toBeTrue();
        expect(foundByName.isArray).toBeTrue();
    });
});