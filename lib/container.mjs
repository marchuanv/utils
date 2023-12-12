import { MemberParameter, Schema, TypeMapper, randomUUID } from '../registry.mjs';
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
/**
 * @param { Object } context
 * @param { class } targetClass
*/
function setClass(context, targetClass) {
    const bag = privateBag.get(context);
    bag.Class = targetClass;
}
export class Container extends Schema {
    /**
     * @param { Array<MemberParameter> } memberParameters
    */
    constructor(memberParameters) {
        const targetClass = new.target;
        if (targetClass === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        if (!TypeMapper.isRegistered(targetClass)) {
            const targetClassId = randomUUID();
            TypeMapper.register(targetClassId, targetClass);
        }
        let _memberParameters = Array.isArray(memberParameters) ? memberParameters: [memberParameters];
        super(_memberParameters);
        privateBag.set(this, {
            parameters: memberParameters,
            Class: targetClass
        });
        super.create();
    }
    /**
     * @returns { class }
    */
    get Class() {
        return getClass(this);
    }
    /**
     * @param { class }
    */
    set Class(value) {
        return setClass(this, value);
    }
    /**
     * @returns { Array<MemberParameter> }
    */
    get parameters() {
        return getParameters(this);
    }
}