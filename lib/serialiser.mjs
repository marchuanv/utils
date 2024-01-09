import { ClassMember, Container, Schema } from '../registry.mjs';
export class Serialiser extends Container {
    /**
     * @param { Container | Array } args
     * @param { class } targetClass
     * @param { class } extendedClassExclusion
    */
    constructor(args, targetClass, extendedClassExclusion) {
        if (args instanceof Container || args instanceof Array) {
            if (args instanceof Container) {
                super(args.parameters);
            }
            if (args instanceof Array) {
                const classMembers = [];
                {
                    let classMember = new ClassMember(targetClass);
                    classMembers.push(classMember);
                    while(classMember.next) {
                        if (classMember.child instanceof ClassMember) {
                            classMember = classMember.child;
                            if (classMember && classMember.type !== Container && classMember.type !== extendedClassExclusion) {
                                classMembers.push(classMember);
                            }
                        }
                    }
                }
                const ctorMethodParameters = [];
                for(const classMember of classMembers) {
                    const ctorMethod = classMember.find('constructor', false, false, true, true, false);
                    for(const param of ctorMethod.parameters) {
                        if (!ctorMethodParameters.find(p => p.name === param.name )) {
                            ctorMethodParameters.push(param);
                        }
                    }
                }
                if (args.length !== ctorMethodParameters.length) {
                    throw new Error('args and class ctor args mistmatch');
                }
                for(let index = 0; index < ctorMethodParameters.length; index++) {
                    const param = ctorMethodParameters[index];
                    const arg = args[index];
                    param.value = arg;
                }
                super(ctorMethodParameters, targetClass);
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
     * @param { class } extendedClassExclusion
     * @returns { T }
    */
    static async deserialise(data, targetClass, extendedClassExclusion) {
        const args = JSON.parse(data);
        const keys = Object.keys(args);
        const _args = [];
        for(const key of keys) {
            _args.push(args[key]);
        }
        const serialiser = new Serialiser(_args, targetClass, extendedClassExclusion);
        await Schema.validate(serialiser);
        const _serialised = await serialiser.serialise();
        if (data !== _serialised) {
            throw new Error('unable to deserialise data');
        }
        return Reflect.construct(targetClass, _args);
    }
}