import {
    Container,
    Dog
} from "../registry.mjs";

describe('when deserialising the Dog class given correct json data', () => {
    it('should deserialise without error', async () => {
        let error = null;
        const serialisedDogStr = JSON.stringify({
            name: "lassy",
            age: 23,
            weight: 15,
            food: {
                name: "epol",
                isAdultFood: true
            },
            type: 'dog'
        });
        let dogInstance = null;
        try {
            dogInstance = await Container.deserialise(serialisedDogStr, Dog);
        } catch (err) {
            error = err;
            console.error(error);
        }
        expect(error).toBeNull();
        expect(dogInstance).not.toBeNull();
        expect(dogInstance).toBeInstanceOf(Dog);
    });
});

describe('when deserialising the Dog class given incorrect json data', () => {
    it('should NOT deserialise', async () => {
        let error = null;
        const serialisedDogStr = JSON.stringify({
            name: "lassy",
            age: 23,
            weight: 15,
            food: {
                name: "epol",
                awdawdisAdultFood: true
            }
        });
        try {
            await Container.deserialise(serialisedDogStr, Dog);
        } catch (err) {
            error = err;
            console.error(error);
        }
        expect(error).toBeDefined();
        expect(error).not.toBeNull();
    });
});