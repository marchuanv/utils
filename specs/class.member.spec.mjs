import {
    Serialiser
} from "../registry.mjs";
import {
    ClassB
} from "./classes/classB.mjs";
import { Dog, Food } from "./index.mjs";

describe('when serialising an instance of classA and classB', () => {
    it('should serialise and deserialise with equality', async () => {
        const baby = new ClassB('john');
        const serialiser1 = new Serialiser(baby);
        const serialisedStr1 = await serialiser1.serialise();
        const deserialisedObj = await serialiser1.deserialise(serialisedStr1);
        const serialiser2 = new Serialiser(deserialisedObj);
        const serialisedStr2 = await serialiser2.serialise();
        expect(deserialisedObj).toBeInstanceOf(ClassB);
        expect(serialisedStr1).toBe(serialisedStr2);
    });
});

describe('when serialising an instance of the dog class', () => {
    it('should serialise and deserialise with equality', async () => {

        const food = new Food('epol', true);
        const dog = new Dog('lassy', 23, 15, food);

        const dogSerialiser = new Serialiser(dog);
        const serialisedDog = await dogSerialiser.serialise();
        const deserialisedDog = await dogSerialiser.deserialise(serialisedDog);

        const dogSerialiser2 = new Serialiser(deserialisedDog);
        const serialisedDog2 = await dogSerialiser2.serialise();
        const deserialisedDog2 = await dogSerialiser2.deserialise(serialisedDog2);

        expect(deserialisedDog).toBeInstanceOf(Dog);
        expect(deserialisedDog2).toBeInstanceOf(Dog);

        expect(serialisedDog).toBe(serialisedDog2);
    });
});