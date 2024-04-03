import { Bag, UUID } from '../registry.mjs';
describe('when creating a universal unique identifier', () => {
    it('should have equality between two UUID instances', () => {
        try {
            const secureContext = Bag.getSecureContext();
            const Id = new UUID('same', secureContext);
            const Id2 = new UUID('same', secureContext);
            expect(Id).toBe(Id2);
        } catch (error) {
            console.log(error);
            fail('expected an error');
        }
    });
    it('should NOT have equality between two UUID instances', () => {
        try {
            const secureContext = Bag.getSecureContext();
            const Id = new UUID('notsame', secureContext);
            const Id2 = new UUID('notsame2', secureContext);
            expect(Id).not.toBe(Id2);
        } catch (error) {
            console.log(error);
            fail('expected an error');
        }
    });
});