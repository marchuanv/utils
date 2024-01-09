import { Container, TypeMapper, VERBOSE, addSchema, validateSchema } from "../registry.mjs";
const schemas = [];
const schema = 'https://json-schema.org/draft/2020-12/schema';

/**
 * @param { String } classId
 * @param { String } className
 */
function createSchemaUrl(classId, className) {
    const path = classId.toString().replace(/\-/g,'');
    const uri = `https://${path}/${className}`;
    if (schemaExists(classId, className)) {
        throw new Error(`schema already exist: ${uri}`);
    }
    schemas.push(uri);
    return uri;
}
/**
 * @param { String } classId
 * @param { String } className
 */
function getSchemaUrl(classId, className) {
    const path = classId.toString().replace(/\-/g,'');
    const uri = `https://${path}/${className}`;
    if (!schemaExists(classId, className)) {
        throw new Error(`schema not found: ${uri}`);
    }
    return uri;
}

/**
 * @param { String } classId
 * @param { String } className
 */
function schemaExists(classId, className) {
    const path = classId.toString().replace(/\-/g,'');
    const uri = `https://${path}/${className}`;
    return schemas.find(schemaUri => schemaUri === uri) !== undefined;
}
export class Schema {
    constructor() {
        const targetClass = new.target;
        if (targetClass === Schema.prototype) {
            throw new Error(`${Schema.name} class is abstract`);
        }
    }
    create() {
        if (!(this instanceof Container)) {
            throw new Error('Critical Error')
        }
        const container = this;
        let targetClass = container.Class;
        const memberParameters = container.parameters;
        const { Id: classId, name: typeName } = TypeMapper.getReferenceType(targetClass);
        if (!schemaExists(classId, typeName)) {
            const title = targetClass.name;
            const properties = memberParameters.reduce((prop, param) => {
                let definition = {};
                const { type, nativeType, isArray } = param.type;
                definition.type = param.type.name;
                const _properties = {};
                const title = param.name;
                let _required = [];
                if (!schemaExists(classId, param.name) && nativeType === Object) {
                    const schemaUri = createSchemaUrl(classId, param.name);
                    if (isArray) {
                        definition.items = { type: 'string' };
                    } else if (type === nativeType) {
                        for(const key of Object.keys(param.value)) {
                            const value = param.value[key];
                            const type = typeof value;
                            const _primitive = TypeMapper.getPrimitiveType(type);
                            if (_primitive) {
                                _properties[key] = {};
                                _properties[key].type =_primitive.name;
                            } else {
                                throw new Error('not implemented');
                            }
                        }
                        _required = Object.keys(_properties);
                        definition['$ref'] = `/${param.name}`;
                    } else {
                        throw new Error('not implemented');
                    }
                    addSchema({
                        "$id": schemaUri,
                        "$schema": schema,
                        title,
                        type: 'object',
                        properties: _properties,
                        required: _required
                    });
                }
                prop[param.name] = definition;
                return prop;
            },{ });
            const required = Object.keys(properties);
            const schemaUri = createSchemaUrl(classId, typeName);
            addSchema({
                "$id": schemaUri,
                "$schema": schema,
                title,
                type: 'object',
                properties,
                required
            });
        }
    }
    /**
     * @param { Container } container
    */
    static async validate(container) {
        let Class = container.Class;
        const { Id: classId, name: typeName } = TypeMapper.getReferenceType(Class);
        const schemaUri = getSchemaUrl(classId, typeName);
        const obj = container.parameters.reduce((_obj, param) => {
            _obj[param.name] = param.value;
            return _obj;
        },{ });
        let output = null;
        try {
            output = await validateSchema(schemaUri, obj, VERBOSE );
            if (!output.valid) {
                throw new Error(`container does not conform to schema: ${schemaUri}`);
            }
        } catch(error) {
            throw error;
        }
    }
}