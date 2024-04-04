import { Bag, Schema, TypeInfo, UUID } from '../registry.mjs';
describe('when creating a bag', () => {
    class TestSchema extends Schema {
        constructor() {
            super([{ name: 'message', typeInfo: new TypeInfo(String) }]);
        }
    }
    it('should set bag without error', () => {
        try {
            const Id = new UUID();
            const secureContext = Bag.getSecureContext();
            const instance = {
                message: 'Hello World'
            };
            const testSchema = new TestSchema();
            Bag.set(Id, secureContext, instance, testSchema);
            const found = Bag.get(Id, secureContext, Object.prototype);
            expect(instance).toBe(found);
        } catch (error) {
            console.log(error);
            fail('expected an error');
        }
    });
    it('should raise context does not exist error', () => {
        const Id = new UUID();
        try {
            const secureContext = Bag.getSecureContext();
            Bag.get(Id, secureContext);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`${Id} not found for secure context.`);
        }
    });
    it('should raise Id already exist error', () => {
        const Id = new UUID();
        try {
            const instance = {
                message: 'Hello World'
            };
            const testSchema = new TestSchema();
            const secureContext = Bag.getSecureContext();
            Bag.set(Id, secureContext, instance, testSchema);
            Bag.set(Id, secureContext, instance, testSchema);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`${Id} for secure context already exists.`);
        }
    });
});