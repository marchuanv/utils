import { Container, MemberSchema } from '../registry.mjs';
const privateBag = new WeakMap();

/**
 * @param { Object } context
 * @returns { MemberSchema }
*/
function getSchema(context) {
    return privateBag.get(context);
}

export class Serialiser {
    /**
     * @param { MemberSchema } schema
    */
    constructor(schema) {
        privateBag.set(this, schema);
    }
    /**
     * @param { Container } container
    */
    async serialise(container) {
        const obj = {};
        const schema = getSchema(this);
        const classMember = schema.type;
        while(classMember.next) {
            const member = classMember.child;
            const property = container.properties.find(prop =>
                prop.name === member.name &&
                member.isProperty &&
                member.isGetter
            );
            if (type === 'string' || type === 'number' || type === 'boolean' || type === 'array') {
                obj[property.name] = property.value;
            } else {
                const serialisedStr = JSON.stringify(property.value);
                obj[property.name] = JSON.parse(serialisedStr);
            }
        }
        return JSON.stringify(obj);
    }
    /**
     * @template T
     * @param { Object } data
     * @param { T } type
     * @returns { T }
    */
    async deserialise(data, type) {
        const schema = getSchema(this);
        await schema.validate(data);
        const classMember = schema.type;
        const ctorMethod = classMember.find('constructor', false, false, true, true, false);
        const propertyNames = Object.keys(schema.properties);
        const args = [];
        for(const propertyName of propertyNames) {
            const schemaProperty = schema.properties[propertyName];
            const param = ctorMethod.parameters.find(p =>
                p.name === propertyName &&
                p.type == schemaProperty['$ref']
            );
            if (param) {
                const value = data[param.name];
                if (value !== undefined) {
                    args.push(value)
                }
            }
        }
        const Class = classMember.type;
        return Reflect.construct(Class, args);
    }
}