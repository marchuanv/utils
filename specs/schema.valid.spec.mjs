import {
    GUID,
    VERBOSE,
    addSchema,
    validateSchema
} from "../registry.mjs";
describe('when creating a complext schema', () => {
    it('should validate without errors', async () => {
        const classId = new GUID();
        const schema = 'https://json-schema.org/draft/2020-12/schema';
        let title = 'Child';
        let typeName = 'Child';
        const childSchemaId = createSchemaUrl(classId, 'child');
        addSchema({
            "$id": childSchemaId,
            "$schema": schema,
            title,
            type: 'object',
            properties: {
                message: { type: 'string' }
            },
            required: ['message']
        });
        title = 'Parent';
        typeName = 'Parent';
        const parentSchemaId = createSchemaUrl(classId, 'parent');
        addSchema({
            "$id": parentSchemaId,
            "$schema": schema,
            title,
            type: 'object',
            properties: {
                child: { '$ref': '/child' }
            },
            required: ['child']
        });
        
        const obj = {
            child: {
                message: 'this is a test'
            }
        }
        let output = null;
        try {
            output = await validateSchema(parentSchemaId, obj, VERBOSE);
            if (!output.valid) {
                throw new Error(`container does not conform to schema: ${parentSchemaId}`);
            }
        } catch(error) {
            throw error;
        }
    });
});
/**
 * @param { String } classId
 * @param { String } className
*/
function createSchemaUrl(classId, className) {
    const path = classId.toString().replace(/\-/g,'');
    return `https://${path}/${className}`;
}