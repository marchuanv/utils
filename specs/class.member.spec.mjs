import {
    Serialiser
} from "../registry.mjs";
import {
    ClassB
} from "./classes/classB.mjs";
describe('when serialising an instance of a class', () => {
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