import { Container } from '../registry.mjs';
export class Serialiser extends Container {
    /**
     * @param { Container } container
    */
    constructor(container) {
        super(container.parameters, container.Id);
    }
    async serialise() {
        const obj = super.parameters.reduce((_obj, memberParam) => {
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
    async deserialise(data) {
        const args = JSON.parse(data);
        const keys = Object.keys(args);
        for (const key of keys) {
            const value = args[key];
            const found = super.parameters.find(mp => mp.name === key);
            if (found) {
                found.value = value;
            }
        }
        await this.validate();
        const targetClass = super.interface.Class;
        return Reflect.construct(targetClass, super.parameters.map(p => p.value));
    }
}