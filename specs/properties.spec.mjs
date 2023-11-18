import { Properties } from '../lib/registry.mjs';

class ContextRoot extends Properties {
    get Id() {
        return super.get('Id', String.prototype);
    }
    set Id(value) {
        super.set('Id', value)
    }
}

class ContextA extends Properties {
    get Id() {
        return super.get('Id', String.prototype);
    }
    set Id(value) {
        super.set('Id', value)
    }
}
class ContextB extends Properties {
    get Id() {
        return super.get('Id', String.prototype);
    }
    set Id(value) {
        super.set('Id', value)
    }
}
class ContextC extends Properties {
    get Id() {
        return super.get('Id', String.prototype);
    }
    set Id(value) {
        super.set('Id', value)
    }
}

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
    it('should share properties with same context', () => {

        const context = new ContextRoot();
        context.Id = '653ef45a-14ba-400b-a1a9-c0695d6b1f06';

        const contextA = new ContextA(context);
        contextA.Id = '250b70e1-fe1f-47eb-8185-04278ddef1bc';

        const contextB = new ContextB(contextA);
        contextB.Id = 'c0785886-6652-4308-aab5-b96b15eb942e';

        const contextC = new ContextC(contextA);
        contextC.Id = 'a70b6d9a-6e3b-40d3-a1b5-08327d1cd6e2';

        expect(context.Id).not.toBe(contextA.Id);
        expect(context.Id).not.toBe(contextB.Id);
        expect(context.Id).not.toBe(contextC.Id);

        expect(contextA.Id).not.toBe(contextB.Id);
        expect(contextA.Id).not.toBe(contextC.Id);

        expect(contextB.Id).toBe(contextC.Id); //they share a context
        expect(contextC.Id).toBe(contextB.Id); //they share a context
    });
});
process.specs.set(suite, []);