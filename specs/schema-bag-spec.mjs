import {
    SchemaBag,
    SecureContext,
    TypeInfo,
    GUIDSchema
} from '../registry.mjs';
fdescribe('when creating schema bags given a secure context', () => {
    it('should have equality between two schema bag instances that have default schemas', () => {
        const secureContext = new SecureContext();
        let schemaBagA = new SchemaBag(secureContext);
        let schemaBagB = new SchemaBag(secureContext);
        expect(schemaBagA).toBe(schemaBagB);
        expect(schemaBagA.toString()).toBe(schemaBagB.toString());
    });
    it('should have equality between two schema bag instances that have similar schemas', () => {
        const secureContext = new SecureContext();
        class SchemaA extends GUIDSchema {
            constructor() {
                super([{
                    name: 'message',
                    typeInfo: new TypeInfo(String)
                }])
            }
        }
        class SchemaB extends GUIDSchema {
            constructor() {
                super([{
                    name: 'message',
                    typeInfo: new TypeInfo(String)
                }])
            }
        }
        const schemaA = new SchemaA();
        const schemaB = new SchemaB();
        let schemaBagA = new SchemaBag(secureContext, schemaA);
        let schemaBagB = new SchemaBag(secureContext, schemaB);
        expect(schemaBagA).toBe(schemaBagB);
        expect(schemaBagA.toString()).toBe(schemaBagB.toString());
    });
    it('should NOT have equality between two schema bag instances that have different schemas', () => {
        const secureContext = new SecureContext();
        class SchemaA extends GUIDSchema {
            constructor() {
                super([{
                    name: 'message1',
                    typeInfo: new TypeInfo(String)
                }])
            }
        }
        class SchemaB extends GUIDSchema {
            constructor() {
                super([{
                    name: 'message2',
                    typeInfo: new TypeInfo(String)
                }])
            }
        }
        const schemaA = new SchemaA();
        const schemaB = new SchemaB();
        let schemaBagA = new SchemaBag(secureContext, schemaA);
        let schemaBagB = new SchemaBag(secureContext, schemaB);
        expect(schemaBagA).not.toBe(schemaBagB);
    });
});