import { Serialiser } from '../registry.mjs';
describe('when serialising', () => {
    it('should serialise a class correctly', () => {
        try {
            class Dog { bark() { } }
            const serialised = Serialiser.serialise(Dog);
            expect(serialised).toBe('{"key":"Dog","script":"class Dog { bark() { } }"}');
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should serialise a String type correctly', () => {
        try {
            const serialised = Serialiser.serialise(String);
            expect(serialised).toBe('{"key":"String","script":"function String() { [native code] }"}');
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should serialise a RegEx correctly', () => {
        try {
            const serialised = Serialiser.serialise(/\something/g);
            expect(serialised).toBe('{"key":"RegExp","value":"/\\\\something/g"}');
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should serialise a Date correctly', () => {
        try {
            const date = new Date();
            const serialised = Serialiser.serialise(date);
            expect(serialised).toBe(`{"key":"Date","value":"${date.toISOString()}"}`);
        } catch (error) {
            console.log(error);
            fail('did not expect any errors');
        }
    });
    it('should raise an error when serialising an empty object.', () => {
        try {
            Serialiser.serialise({});
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('obj does not have any properties.');
        }
    });
});