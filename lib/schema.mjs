import { Container, addSchema, validateSchema, VERBOSE, MemberParameter  } from "../registry.mjs";
const privateBag = new WeakMap();
const namespace = `https://members/`;
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
            const refTypeName = param.type.name.toLowerCase();
            let definition = {};
            if (refTypeName === 'array') {
                definition.type = 'array';
                const itemType = param.associatedType.name.toLowerCase();
                definition.items = {
                    type: itemType
                };
            } else if (refTypeName === 'object') {
                throw new Error('not implemented');
                
            } else if (refTypeName === 'boolean' || refTypeName === 'string' || refTypeName === 'number') {
                definition.type = refTypeName;
            } else {
                throw new Error('unable to determine type');
            }
            prop[param.name] = definition;
            return prop;
        },{ });
        const required = Object.keys(properties);
        const Id = `${namespace}${typeName}`;
        privateBag.set(this, { Id, title, type: targetClass, typeName, properties, required });
        addSchema({
            "$id": Id,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
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