import { GUID, MemberParameter, Schema, TypeMapper } from '../registry.mjs';
const privateBag = new WeakMap();
/**
 * @param { Object } context
 * @returns { Array<MemberParameter> }
*/
function getParameters(context) {
    const { parameters } = privateBag.get(context);
    return parameters;
}
/**
 * @param { Object } context
 * @returns { class }
*/
function getClass(context) {
    const { Class } = privateBag.get(context);
    return Class;
}
export class Container extends Schema {
    /**
     * @param { Array<MemberParameter> } memberParameters
     * @param { class } targetClass
    */
    constructor(memberParameters, targetClass = null) {
        let Class = new.target;
        if (Class === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        if (targetClass) {
            Class = targetClass;
        }
        if (!TypeMapper.isRegistered(Class)) {
            const targetClassId = new GUID();
            TypeMapper.register(targetClassId, Class);
        }
        let _memberParameters = Array.isArray(memberParameters) ? memberParameters: [memberParameters];
        super(_memberParameters);
        privateBag.set(this, { parameters: memberParameters, Class });
        super.create();
        Object.freeze(this);
    }
    /**
     * @returns { class }
    */
    get Class() {
        return getClass(this);
    }
    /**
     * @returns { Array<MemberParameter> }
    */
    get parameters() {
        return getParameters(this);
    }
}