import { Container, MemberParameter, TypeMapper, VERBOSE, addSchema, validateSchema } from "../registry.mjs";
const privateBag = new WeakMap();
const namespace = `https://members/`;
const schema = 'https://json-schema.org/draft/2020-12/schema';
export class Schema {
    /**
     * @param { String } title
     * @param { Object } type
     * @param { Array<MemberParameter> } memberParameters
    */
    constructor(memberParameters) {
        const targetClass = new.target;
        if (targetClass === Schema.prototype) {
            throw new Error(`${Schema.name} class is abstract`);
        }
        let title = targetClass.name;
        let typeName = targetClass.name.toLowerCase();
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
                        const typeName = info.type.name;
                        const Id = `${namespace}${param.name}`;
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
                            "$id": Id,
                            "$schema": schema,
                            title,
                            type: typeName,
                            properties: _properties,
                            required: _required
                        });
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
        const Id = `${namespace}${typeName}`;
        privateBag.set(this, { Id, title, type: targetClass, typeName, properties, required });
        addSchema({
            "$id": Id,
            "$schema": schema,
            title,
            type: 'object',
            properties,
            required
        });
    }
    /**
     * @template T
     * @param { Container } container
     * @param { T } type
    */
    static async validate(container, type) {
        if (!type.constructor) {
            throw new Error(`type argument must be a class`);
        }
        const typeName = type.name.toLowerCase();
        const Id = `${namespace}${typeName}`;
        const obj = container.parameters.reduce((_obj, param) => {
            _obj[param.name] = param.value;
            return _obj;
        },{ });
        let output = await validateSchema(Id, obj, VERBOSE );
        if (!output.valid) {
            throw new Error(`container does not conform to schema: ${Id}`);
        }
    }
}