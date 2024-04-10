import { UUID } from '../registry.mjs';
describe('when creating a universal unique identifier', () => {
    it('should have equality between two UUID instances', () => {
        try {
            const Id = new UUID('same');
            const Id2 = new UUID('same');
            expect(Id).toBe(Id2);
        } catch (error) {
            console.log(error);
            fail('expected an error');
        }
    });
    it('should NOT have equality between two UUID instances', () => {
        try {
            const Id = new UUID('notsame');
            const Id2 = new UUID('notsame2');
            expect(Id).not.toBe(Id2);
        } catch (error) {
            console.log(error);
            fail('expected an error');
        }
    });
});