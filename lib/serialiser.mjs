import { Container, Schema } from '../registry.mjs';
export class Serialiser extends Container {
    /**
     * @param { class } targetClass
    */
    constructor(container) {
        super(null, container.);
    }
    async serialise() {
        const classInterface = this.interface;
        const memberParameters = classInterface.ctor.parameters;
        const obj = memberParameters.reduce((_obj, memberParam) => {
            _obj[memberParam.name] = memberParam.value;
            return _obj;
        }, {});
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
        const classInterface = this.interface;
        const args = JSON.parse(data);
        const keys = Object.keys(args);
        for (const key of keys) {
            const value = args[key];
            const found = classInterface.ctor.parameters.find(mp => mp.name === key);
            if (found) {
                found.value = value;
            }
        }
        const serialiser = new Serialiser(null, targetClass, extendedClassExclusion);
        await Schema.validate(serialiser);
        const _serialised = await serialiser.serialise();
        if (data !== _serialised) {
            throw new Error('unable to deserialise data');
        }
        return Reflect.construct(targetClass, _args);
    }
}