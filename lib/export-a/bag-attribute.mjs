import { UUID } from '../../registry.mjs';
export class BagAttribute extends UUID {
    /**
     * @param { Function } func
    */
    constructor(func) {
        const targetClass = new.target;
        if (!targetClass.name.toLowerCase().endsWith('Attribute') && !targetClass.name.toLowerCase().endsWith('Att')) {
            throw new Error(`${targetClass.name} class failed naming convention.`);
        }
        if (func === null || func === undefined || typeof func !== 'function') {
            throw new Error(`The func argument is null, undefined or not a function.`);
        }
        this._attributeType = targetClass;
        this._func = func;
        super(`${targetClass.name}<${func.name}>`);
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