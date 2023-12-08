import { ClassMember, Container } from '../registry.mjs';
export class Serialiser extends Container {
    /**
     * @param { Container | Array } args
     * @param { class } targetClass
    */
    constructor(args, targetClass) {
        if (args instanceof Container || args instanceof Array) {
            if (args instanceof Container) {
                super(args.parameters);
            }
            if (args instanceof Array) {
                let classMember = new ClassMember(targetClass);
                classMember.reset();
                while(classMember.next) {
                    if (classMember.child instanceof ClassMember) {
                        classMember = classMember.child;
                    }
                }
                const ctorMethod = classMember.find('constructor', false, false, true, true, false);
                if (args.length !== ctorMethod.parameters.length) {
                    throw new Error('args and class ctor args mistmatch');
                }
                for(let index = 0; index < ctorMethod.parameters.length; index++) {
                    const param = ctorMethod.parameters[index];
                    const arg = args[index];
                    param.value = arg;
                }
                super(ctorMethod.parameters);
            }
        } else {
            throw new Error(`args is null or undefined or not of type ${Container.name} or ${Array.name}`);
        }
    }
    async serialise() {
        const obj = super.parameters.reduce((_obj, param) => {
            _obj[param.name] = param.value;
            return _obj;
        },{ });
        return JSON.stringify(obj);
    }
    /**
     * @template T
     * @param { String } data
     * @param { T } targetClass
     * @returns { T }
    */
    static async deserialise(data, targetClass) {
        let args = JSON.parse(data);
        const keys = Object.keys(args);
        const _args = [];
        for(const key of keys) {
            _args.push(args[key]);
        }
        // const serialiser = new Serialiser(_args, targetClass);
        // const schema = getSchema(this);
        // await schema.validate(data);
        // const classMember = schema.type;
        // const ctorMethod = classMember.find('constructor', false, false, true, true, false);
        // const propertyNames = Object.keys(schema.properties);
        // for(const propertyName of propertyNames) {
        //     const schemaProperty = schema.properties[propertyName];
        //     const param = ctorMethod.parameters.find(p =>
        //         p.name === propertyName &&
        //         p.type == schemaProperty['$ref']
        //     );
        //     if (param) {
        //         const value = data[param.name];
        //         if (value !== undefined) {
        //             args.push(value)
        //         }
        //     }
        // }
        // const Class = classMember.type;
        // return Reflect.construct(Class, args);
    }
}