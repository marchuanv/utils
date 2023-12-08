import { Container, addSchema, validateSchema, VERBOSE, ContainerItem  } from "../registry.mjs";
const privateBag = new WeakMap();
const namespace = `https://members/`;
export class Schema {
    /**
     * @param { String } title
     * @param { Object } type
     * @param { Array<ContainerItem> } containerItems
    */
    constructor(containerItems) {
        const targetClass = new.target;
        if (targetClass === Schema.prototype) {
            throw new Error(`${Schema.name} class is abstract`);
        }
        let title = targetClass.name;
        let typeName = targetClass.name.toLowerCase();
        const properties = containerItems.reduce((refs, ref) => {
            const refTypeName = ref.type.name.toLowerCase();
            let definition = {};
            if (refTypeName === 'array') {
                definition.type = 'array';
                const itemType = ref.itemType.name.toLowerCase();
                definition.items = {
                    type: itemType
                };
            } else if (refTypeName === 'object') {
                
            } else if (refTypeName === 'boolean' || refTypeName === 'string' || refTypeName === 'number') {
                definition.type = refTypeName;
            } else {
                throw new Error('unable to determine type');
            }
            refs[ref.name] = definition;
            return refs;
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
        const obj = container.ctor;
        obj.organs = 'test';
        let output = await validateSchema(Id, obj, VERBOSE );
        if (!output.valid) {
            throw new Error(`container does not conform to schema: ${Id}`);
        }
    }
}