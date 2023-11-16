import { Context, Properties } from '../lib/registry.mjs';
class PropertiesTest extends Properties {
    get Id() {
        return super.get('Id', String.prototype);
    }
    set Id(value) {
        super.set('Id', value)
    }
}
class PropertiesTestHierarchy extends Properties {
    get propertiesTest() {
        return super.get('propertiesTest', PropertiesTest.prototype);
    }
    set propertiesTest(value) {
        super.set('propertiesTest', value)
    }
}
const suite = describe('when properties change', () => {
    it('should sync data', () => {
        const properties = new PropertiesTest();
        const actualValue = 'ef7cbdeb-6536-4e38-a9e1-cc1acdd00e7d';
        properties.Id = actualValue;
        expect(properties.Id).toBe(actualValue);
        properties.onSet('Id', (value) => {
            return actualValue;
        });
        const expectedValue = '5a0bf50b-6ba5-4570-984c-cdcada1d19f0';
        properties.Id = expectedValue; //onChange
        expect(properties.Id).toBe(actualValue);
    });
    it('should sync data within context', () => {
        const properties = new PropertiesTest();
        const actualValue = 'b4ad82a4-d76e-4b36-bc4d-f0ca5386622f';
        properties.Id = actualValue;
        expect(properties.Id).toBe(actualValue);
        properties.onSet('Id', (value) => {
            return actualValue;
        });
        const expectedValue = '1deccbb7-b859-4e77-a1b5-7b5b58ce3b31';
        properties.Id = expectedValue; //onChange
        expect(properties.Id).toBe(actualValue);
    });
    it('should serialise', () => {
        const propertiesTestHierarchy = new PropertiesTestHierarchy();
        const propertiesTest = new PropertiesTest();
        propertiesTestHierarchy.propertiesTest = propertiesTest;
        const actualValue = 'ef7cbdeb-6536-4e38-a9e1-cc1acdd00e7d';
        propertiesTest.Id = actualValue;
        const serialise = propertiesTestHierarchy.serialise();
        expect(propertiesTest.Id).toBe(actualValue);
        expect(serialise).toBeDefined();
    });
    it('should share properties context', () => {
        const sharedContext = new Context();
        const propertiesTest1 = new PropertiesTest(sharedContext);
        propertiesTest1.Id = '53133497-bc28-4d70-9989-116afa2708bc';
        const propertiesTest2 = new PropertiesTest(sharedContext);
        propertiesTest2.Id = 'd05081fb-911f-4def-8fcd-4f8f61607085';
        const propertiesTest3 = new PropertiesTest(sharedContext);
        propertiesTest3.Id = '50b96ac8-d838-4dfb-bde0-cda761762e60';
        const propertiesTest4 = new PropertiesTest(sharedContext);
        propertiesTest4.Id = 'f4b98f82-2ed8-425c-88d6-f1aef96d2f03';
        expect(propertiesTest1.Id).toBeDefined();
        expect(propertiesTest2.Id).toBeDefined();
        expect(propertiesTest3.Id).toBeDefined();
        expect(propertiesTest1.Id).not.toBe(propertiesTest2.Id);
        expect(propertiesTest1.Id).not.toBe(propertiesTest3.Id);
        expect(propertiesTest2.Id).toBe(propertiesTest3.Id); //using shared bag and eventraiser
        expect(propertiesTest2.Id).toBe(propertiesTest4.Id); //using shared bag and eventraiser
    });
});
process.specs.set(suite, []);