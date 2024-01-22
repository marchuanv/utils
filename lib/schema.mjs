import { ClassInterface, TypeDefinition, VERBOSE, addSchema, validateSchema } from "../registry.mjs";
const schema = 'https://json-schema.org/draft/2020-12/schema';
const privateBag = new WeakMap();
export class Schema {
    /**
     * @param { ClassInterface } classInterface
    */
    constructor(classInterface) {
        const targetClass = new.target;
        if (targetClass !== Schema.prototype && targetClass !== Schema) {
            throw new Error(`${Schema.name} class is abstract`);
        }
        const ctorMethodMember = classInterface.ctor;
        const existingSchema = getSchema(ctorMethodMember.typeDefinition);
        if (existingSchema) {
            privateBag.set(this, existingSchema);
        } else {
            const properties = {};
            for (const param of ctorMethodMember.parameters) {
                properties[param.name] = {};
                const property = properties[param.name];
                const typeDefinition = param.typeDefinition;
                const classInterfaceDep = ClassInterface.find(typeDefinition.Id);
                if (classInterfaceDep) {
                    property['$ref'] = classInterfaceDep.schema.url;
                } else {
                    let schema = getSchema(typeDefinition);
                    if (!schema) {
                        schema = createSchema(typeDefinition, {});
                    }
                    property['$ref'] = schema['$id'];
                }
            }
            const schema = createSchema(ctorMethodMember.typeDefinition, properties);
            privateBag.set(this, schema);
            privateBag.set(schema, classInterface);
        }
    }
    get url() {
        const { $Id, title } = privateBag.get(this);
        const path = $Id.toString().replace(/\-/g, '');
        return `https://${path}/${title}`;
    }
    async validate() {
        const schema = privateBag.get(this);
        const classInterface = privateBag.get(schema);
        const parameters = classInterface.ctor.parameters;
        const obj = parameters.reduce((_obj, param) => {
            _obj[param.name] = param.value;
            return _obj;
        }, {});
        let output = null;
        const schemaUri = schema['$id'];
        try {
            output = await validateSchema(schemaUri, obj, VERBOSE);
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
}
privateBag.set(Schema, []);
/**
 * @param { TypeDefinition } classInterface
 * @param { Object } properties
*/
function createSchema(typeDefinition, properties) {
    const { Id, typeName, isObject, isArray, name, isReferenceType } = typeDefinition;
    const path = Id.toString().replace(/\-/g, '');
    const schemaUri = `https://${path}/${typeName}`;
    const type = isReferenceType ? (isArray ? 'array' : 'object') : name;
    const required = Object.keys(properties);
    const newSchema = {
        "$id": schemaUri,
        "$schema": schema,
        title: typeName,
        type,
        properties,
        required
    };
    addSchema(newSchema);
    privateBag.get(Schema).push(newSchema);
    return newSchema;
}
/**
 * @param { TypeDefinition } typeDefinition
 * @returns { Boolean }
*/
function getSchema(typeDefinition) {
    const { Id, typeName } = typeDefinition;
    return privateBag.get(Schema).find(s => s['$id'] === Id || s.title === typeName);
}