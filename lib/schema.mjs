import { Container, ContainerReference, addSchema, validateSchema } from "../registry.mjs";
const privateBag = new WeakMap();
const namespace = `https://members/`;
const javascriptTypes = [ 'string', 'number', 'boolean', 'array', 'object' ];
for(const type of javascriptTypes) {
    addSchema({
        "$id": `${namespace}${type}`,
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": type
    });
};
export class Schema {
    /**
     * @param { String } title
     * @param { Object } type
     * @param { Array<ContainerReference> } references
    */
    constructor(title, type, references) {
        const typeName = type.name.toLowerCase();
        const properties = references.reduce((refs, ref) => {
            const refTypeName = ref.type.name.toLowerCase();
            if (!refs[ref.name]) {
                const property = {
                    '$ref': `/${refTypeName}`
                };
                refs[ref.name] = property;
            }
            return refs;
        },{ });
        const required = Object.keys(properties);
        const Id = `${namespace}${typeName}`;
        privateBag.set(this, { Id, title, type, typeName, properties, required });
        addSchema({
            "$id": Id,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            title,
            "type": typeName,
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
        let output = await validateSchema(Id, container.ctor);
        if (!output.valid) {
            throw new Error(`container does not conform to schema: ${Id}`);
        }
    }
}