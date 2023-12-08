import { MemberParameter, Schema } from '../registry.mjs';
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
    */
    constructor(memberParameters) {
        const targetClass = new.target;
        if (targetClass === Container.prototype) {
            throw new Error(`${Container.name} class is abstract`);
        }
        let _memberParameters = Array.isArray(memberParameters) ? memberParameters: [memberParameters];
        super(_memberParameters);
        privateBag.set(this, {
            parameters: memberParameters,
            Class: targetClass
        });
        Schema.validate(this, targetClass).catch((error) => {
            console.error(error);
        });
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