import { Member, addSchema, validateSchema } from "../registry.mjs";

export class Schema {
    /**
     * @param { Member } classMember 
     */
    constructor(classMember) {
        addSchema({
            "$id": "https://component.properties/bagitem",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "BagItem",
            "type": "object",
            "properties": {
                "name": { "$ref": "/string" },
                "value": { "$ref": "/object" },
                "readOnly": { "$ref": "/boolean" },
                "type": { "$ref": "/string" },
                "isSerialised": { "$ref": "/boolean" },
                "isCtorParam": { "$ref": "/boolean" },
                "isContext": { "$ref": "/boolean" }
            },
            "required": [
                "name",
                "value",
                "readOnly",
                "type",
                "isSerialised",
                "isCtorParam",
                "isContext"
            ]
        });
        addSchema({
            "$id": "https://component.properties/string",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "string"
        });
        addSchema({
            "$id": "https://component.properties/object",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object"
        });
        addSchema({
            "$id": "https://component.properties/number",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "number"
        });
        addSchema({
            "$id": "https://component.properties/boolean",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "boolean"
        });
    }
    /**
     * @param { Object } obj
    */
    async validate(obj) {
        let output = await validateSchema("https://component.properties/bagitem", obj);
        if (!output.valid) {
            throw new Error('obj does not conform to schema: https://component.properties/bagitem');
        }
    }
}