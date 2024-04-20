import { Reflection, UUID } from '../../registry.mjs';
export class BagAttribute extends UUID {
    /**
     * @param { Function } func
    */
    constructor(func) {
        const targetClass = new.target;
        if (!targetClass.name.toLowerCase().endsWith('attribute') && !targetClass.name.toLowerCase().endsWith('att')) {
            throw new Error(`${targetClass.name} class failed naming convention.`);
        }
        if (!Reflection.isTypeOf(func, Function)) {
            throw new Error(`The func argument is not a function.`);
        }
        super(`${targetClass.name}<${func.name}>`);
        this._attributeType = targetClass;
        this._func = func;
        Object.freeze(this._func);
        Object.freeze(this._attributeType);
        Object.freeze(this);
    }
    /**
     * @returns { class }
    */
    get attributeType() {
        return this._attributeType;
    }
    /**
     * @returns { class }
    */
    get func() {
        return this._func;
    }
}