import { GUID, TypeDefinition, VERBOSE, addSchema, validateSchema } from "../registry.mjs";
const privateBag = new WeakMap();
export class Schema {
    /**
     * @param { GUID } classId
     * @param { String } className
     * @param { String } title
     * @param { String } type
     * @param { Object } properties
     * @param { Array<String> } required
    */
    constructor(classId, className, title, type, properties, required) {
        const targetClass = new.target;
        if (targetClass !== Schema.prototype && targetClass !== Schema) {
            throw new Error(`${Schema.name} class is abstract`);
        }
        const schema = {
            "$id": `https://${classId}/${className}`,
            "$schema": 'https://json-schema.org/draft/2020-12/schema',
            title,
            type,
            properties,
            required
        };
        addSchema(schema);
        privateBag.set(this, schema);
    }
    get url() {
        const { $id } = privateBag.get(this);
        return $id;
    }
    /**
     * @param { Object } obj
    */
    async validate(obj) {
        let output = null;
        try {
            output = await validateSchema(this.url, obj, VERBOSE);
            if (!output.valid) {
                throw new Error(`container does not conform to schema: ${schemaUri}`);
            }
        } catch (error) {
            if (error.output && error.output.errors) {
                let errors = error.output.errors;
                let _error = errors.find(err => !err.valid);
                let prevError = null;
                while (_error) {
                    prevError = _error;
                    errors = _error.errors;
                    _error = errors.find(err => !err.valid);
                }
                throw new Error(JSON.stringify(prevError, null, 4));
            } else {
                throw error;
            }
        }
    }
    /**
     * @param { TypeDefinition } typeDefinition
     * @returns { Schema }
    */
    static getSchema(typeDefinition) {
        const { Id, typeName } = typeDefinition;
        return findSchema({ classId: Id, className: typeName });
    }
    /**
     * @param { TypeDefinition } classInterface
     * @param { Object } properties
     * @returns { Schema }
    */
    static createSchema(typeDefinition, properties) {
        const { Id, typeName, isArray, name, isReferenceType } = typeDefinition;
        const type = isReferenceType ? (isArray ? 'array' : 'object') : name;
        const required = Object.keys(properties);
        const newSchema = new Schema(Id, typeName, name, type, properties, required);
        privateBag.get(Schema).push(newSchema);
        return newSchema;
    }
}
privateBag.set(Schema, []);
/**
 * @param {{ className: String, classId: GUID, title: String, $Id } } criteria
 * @returns { Schema }
*/
function findSchema(criteria) {
    const { className, classId, title, $Id } = criteria;
    return privateBag.get(Schema).find(s =>
        ($Id && s['$id'] === $Id) ||
        (title && s.title === title) ||
        (classId && className && s.url === `https://${classId}/${className}`)
    );
}