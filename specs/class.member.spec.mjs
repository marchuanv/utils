import {
    ClassB,
    Serialiser
} from "../registry.mjs";
describe('when serialising an instance of a class', () => {
    fit('should serialise and deserialise with equality', async () => {
        const baby = new ClassB('john');
        const serialiser1 = new Serialiser(baby, ClassB);
        const serialisedStr1 = await serialiser1.serialise();
        const deserialisedObj = await Serialiser.deserialise(serialisedStr1, ClassB);
        const serialiser2 = new Serialiser(deserialisedObj, ClassB);
        const serialisedStr2 = await serialiser2.serialise();
        expect(deserialisedObj).toBeInstanceOf(ClassB);
        expect(serialisedStr1).toBe(serialisedStr2);
    });
});