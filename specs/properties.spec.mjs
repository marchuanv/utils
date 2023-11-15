import { Properties } from '../lib/registry.mjs';
const suite = describe('when properties change', () => {
    it('should sync data', () => {
        const properties = new Properties();
        const actualValue = 'ef7cbdeb-6536-4e38-a9e1-cc1acdd00e7d';
        properties.Id = actualValue;
        expect(properties.Id).toBe(actualValue);
        properties.onChange('Id', (value) => {
            return actualValue;
        });
        const expectedValue = '5a0bf50b-6ba5-4570-984c-cdcada1d19f0';
        properties.Id = expectedValue; //onChange
        expect(properties.Id).toBe(actualValue);
    });
    it('should sync data within context', () => {
        const properties = new Properties();
        const actualValue = 'b4ad82a4-d76e-4b36-bc4d-f0ca5386622f';
        properties.Id = actualValue;
        expect(properties.Id).toBe(actualValue);
        properties.onChange('Id', (value) => {
            return actualValue;
        });
        const expectedValue = '1deccbb7-b859-4e77-a1b5-7b5b58ce3b31';
        properties.Id = expectedValue; //onChange
        expect(properties.Id).toBe(actualValue);
    });
});
process.specs.set(suite, []);