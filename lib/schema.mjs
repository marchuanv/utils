import {
    GUID, TypeDefinition,
    VERBOSE, addSchema, fileURLToPath, join,
    readFileSync,
    validateSchema,
    walkDir
} from "../registry.mjs";
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
        privateBag.get(Schema).push(this);
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
                throw new Error(`container does not conform to schema: ${this.url}`);
            }
        } catch (error) {
            output = error.output ? error.output : output;
            if (output && output.errors) {
                let errors = output.errors;
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
        return Schema.findSchema({ classId: Id, className: typeName });
    }
    /**
     * @param {{ className: String, classId: GUID, title: String, $Id } } criteria
     * @returns { Schema }
    */
    static findSchema(criteria) {
        const { className, classId, title, $Id } = criteria;
        return privateBag.get(Schema).find(s =>
            ($Id && s['$id'] === $Id) ||
            ($Id && s.url === $Id) ||
            (title && s.title === title) ||
            (classId && className && s.url === `https://${classId}/${className}`)
        );
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
        return new Schema(Id, typeName, name, type, properties, required);
    }
}
privateBag.set(Schema, []);

const currentDir = fileURLToPath(new URL('./', import.meta.url));
const schemasDirPath = join(currentDir, 'schemas');
walkDir(schemasDirPath, (filePath) => {
    if (filePath.endsWith('.schema.json')) {
        const { $id, title, type, properties, required } = JSON.parse(readFileSync(filePath));
        const split = $id.split('/');
        const guid = split[2];
        const className = split[3];
        new Schema(new GUID(guid), className, title, type, properties, required);
    }
});
