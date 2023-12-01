import { Member, addSchema, validateSchema } from "../registry.mjs";
export class MemberSchema {
    /**
     * @param { Member } classMember
    */
    constructor(classMember) {
        if (!classMember.isClass) {
            throw new Error('member is not a class');
        }
        const primitiveTypes = [ 'string', 'number', 'boolean' ];
        const namespace = `https://members/`;
        this._namespace = namespace;
        const className = classMember.name;
        this._className = className;
        const properties = {};
        const required = [];
        while(classMember.next) {
            const child = classMember.child;
            if (child.isProperty) {
                properties[child.name] = {};
                const property = properties[child.name];
                const isPrimtiveType = primitiveTypes.find(type => type === child.type);
                if (isPrimtiveType) {
                    property['$ref'] = `/${child.type}`;
                }
                required.push(child.name);
            }
        }
        addSchema({
            "$id": `${namespace}${className}`,
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": className,
            "type": classMember.type,
            properties,
            required
        });
        for(const type of primitiveTypes) {
            addSchema({
                "$id": `${namespace}${type}`,
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "type": type
            });
        };
    }
    /**
     * @param { Object } obj
    */
    async validate(obj) {
        const Id = `${this._namespace}${this._className}`;
        let output = await validateSchema(Id, obj);
        if (!output.valid) {
            throw new Error(`obj does not conform to schema: ${Id}`);
        }
    }
}