import { Container, ContainerReference, addSchema, validateSchema } from "../registry.mjs";
const privateBag = new WeakMap();
const namespace = `https://members/`;
const javascriptTypes = [ 'string', 'number', 'boolean', 'array', 'object' ];
for(const type of javascriptTypes) {
    if (type === 'array') {
        addSchema({
            "$id": `${namespace}${type}`,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": type
        });
    } else  if (type === 'object') {
        addSchema({
            "$id": `${namespace}${type}`,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": type
        });
    } else {
        addSchema({
            "$id": `${namespace}${type}`,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": type
        });
    }
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
     * @return { String }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @return { Object }
    */
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    /**
     * @return { String }
    */
    get title() {
        const { title } = privateBag.get(this);
        return title;
    }
    /**
     * @return { class }
    */
    get namespace() {
        const { typeName } = privateBag.get(this);
        return typeName;
    }
    /**
     * @return { Array<Object> }
    */
    get properties() {
        const { properties } = privateBag.get(this);
        return properties;
    }
    /**
     * @return { Array<String> }
    */
    get required() {
        const { required } = privateBag.get(this);
        return required;
    }
    /**
     * @param { Container } container
    */
    static async validate(container) {
        if (!(container instanceof Container)) {
            throw new Error(`container argument is not an instance of ${Container.name}`);
        }
        let output = await validateSchema(this.Id, container.references);
        if (!output.valid) {
            throw new Error(`container does not conform to schema: ${this.Id}`);
        }
    }
}