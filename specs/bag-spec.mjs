import { Bag, Schema, SecureContext, TypeInfo } from '../registry.mjs';
describe('when creating a bag', () => {
    class TestSchema extends Schema {
        constructor() {
            super([{ name: 'message', typeInfo: new TypeInfo({ type: String }) }]);
        }
    }
    it('should set bag without error', () => {
        try {
            const Id = '1cfd446a-43f2-4ebd-8a45-4783d76f7761';
            const instance = {
                message: 'Hello World'
            };
            const secureContext = new SecureContext();
            const testSchema = new TestSchema();
            const typeInfo = new TypeInfo({ type: Object });
            Bag.set(Id, instance, testSchema, typeInfo, secureContext);
            const bagKey = Bag.getKey(Id, secureContext);
            expect(Bag.has(bagKey)).toBeTrue();
        } catch (error) {
            console.log(error);
            fail('expected an error');
        }
    });
    it('should raise context does not exist error', () => {
        try {
            const Id = '1cfd446a-43f2-4ebd-8a45-4783d76f7761';
            const secureContext = new SecureContext();
            Bag.getKey(Id, secureContext);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('secure context does not exist.');
        }
    });
    it('should raise Id already exist error', () => {
        try {
            const Id = 'af6165b1-5d08-4567-b654-6da7bb176914';
            const instance = {
                message: 'Hello World'
            };
            const testSchema = new TestSchema();
            const secureContext = new SecureContext();
            const typeInfo = new TypeInfo({ type: Object });
            Bag.set(Id, instance, testSchema, typeInfo, secureContext);
            Bag.set(Id, instance, testSchema, typeInfo, secureContext);
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe('Id already exists.');
        }
    });
});