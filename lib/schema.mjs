import { Container, TypeMapper, VERBOSE, addSchema, validateSchema } from "../registry.mjs";
const schemas = [];
const schema = 'https://json-schema.org/draft/2020-12/schema';

/**
 * @param { String } classId
 * @param { String } className
 */
function createSchemaUrl(classId, className) {
    const path = classId.replace(/\-/g,'');
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
    const path = classId.replace(/\-/g,'');
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
    const path = classId.replace(/\-/g,'');
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
        const targetClass = container.Class;
        const memberParameters = container.parameters;
        const { Id: classId } = TypeMapper.getClass(targetClass);
        const typeName = targetClass.name.toLowerCase();
        if (!schemaExists(classId, typeName)) {
            let title = targetClass.name;
            const properties = memberParameters.reduce((prop, param) => {
                const { info } = param.typeMap;
                let definition = {};
                switch(info.type) {
                    case Array: {
                        definition.type = 'array';
                        switch(info.associatedType) {
                            case String: {
                                definition.items = { type: 'string' };
                                break;
                            }
                            case Number: {
                                definition.items = { type: 'number' };
                                break;
                            }
                            case Boolean: {
                                definition.items = { type: 'boolean' };
                                break;
                            }
                            case Object: {
                                throw new Error('not implemented');
                            }
                        }
                        break;
                    }
                    case Object: {
                        if (info.type === info.associatedType) {
                            if (!schemaExists(classId, param.name)) {
                                const typeName = info.type.name;
                                const schemaUri = createSchemaUrl(classId, param.name);
                                const title = param.name;
                                const _properties = {};
                                for(const key of Object.keys(param.value)) {
                                    const value = param.value[key];
                                    const valueType = typeof value;
                                    const { info } = new TypeMapper(valueType);
                                    _properties[key] = {};
                                    _properties[key].type = info.toString();
                                }
                                const _required = Object.keys(_properties);
                                addSchema({
                                    "$id": schemaUri,
                                    "$schema": schema,
                                    title,
                                    type: 'object',
                                    properties: _properties,
                                    required: _required
                                });
                            }
                            definition['$ref'] = `/${param.name}`;
                            break;
                        } else {
                            throw new Error('not implemented');
                        }
                    }
                    case String: {
                        definition.type = 'string';
                        break;
                    }
                    case Number: {
                        definition.type = 'number';
                        break;
                    }
                    case Boolean: {
                        definition.type = 'boolean';
                        break;
                    }
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
        const { Id: classId , targetClass } = TypeMapper.getClass(Class);
        const typeName = targetClass.name.toLowerCase();
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