import { TypeDefinition } from "../registry.mjs";
import { ClassA } from './classes/classA.mjs';
import { ClassB } from './classes/classB.mjs';
import { Dog } from './classes/dog.mjs';
import { Food } from './classes/food.mjs';
describe('when mapping types', () => {
    it('should register and find classA', () => {
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
        const foundByClass = TypeDefinition.find({ type: ClassB });
        const foundByName = TypeDefinition.find({ typeName: ClassB.name });

        expect(foundByClass).toBeDefined();
        expect(foundByName).toBeDefined();

        expect(foundByClass).not.toBeNull();
        expect(foundByName).not.toBeNull();

        expect(foundByClass.isObject).toBeFalse();
        expect(foundByName.isObject).toBeFalse();
    });
    it('should register and find Dog', () => {
        const foundByClass = TypeDefinition.find({ type: Dog });
        const foundByName = TypeDefinition.find({ typeName: Dog.name });

        expect(foundByClass).toBeDefined();
        expect(foundByName).toBeDefined();

        expect(foundByClass).not.toBeNull();
        expect(foundByName).not.toBeNull();

        expect(foundByClass.isObject).toBeFalse();
        expect(foundByName.isObject).toBeFalse();
    });
    it('should register and find Food', () => {
        const foundByClass = TypeDefinition.find({ type: Food });
        const foundByName = TypeDefinition.find({ typeName: Food.name });

        expect(foundByClass).toBeDefined();
        expect(foundByName).toBeDefined();

        expect(foundByClass).not.toBeNull();
        expect(foundByName).not.toBeNull();

        expect(foundByClass.isObject).toBeFalse();
        expect(foundByName.isObject).toBeFalse();
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