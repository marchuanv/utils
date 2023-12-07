import { addSchema, validateSchema } from "../registry.mjs";
const privateBag = new WeakMap();
const namespace = `https://members/`;
const javascriptTypes = [ 'string', 'number', 'boolean', 'array' ];
for(const type of javascriptTypes) {
    if (type === 'array') {
        addSchema({
            "$id": `${namespace}${type}`,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": type,
            "properties": {
                array: []
            }
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
     * @param { Object } properties
    */
    constructor(title, type, properties) {
        const typeName = type.name.toLowerCase();
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
     * @param { Object } obj
    */
    async validate(obj) {
        let output = await validateSchema(this.Id, obj);
        if (!output.valid) {
            throw new Error(`obj does not conform to schema: ${this.Id}`);
        }
    }
}