import {
    Bag,
    BagState,
    JavaScriptType,
    Property,
    Reflection,
    SecureContext,
    State
} from "../../registry.mjs";
export function ANY() { }
export class Type extends BagState {
    /**
     * @param { Function | Array<Function> | String } func
     * @param { SecureContext } secureContext
    */
    constructor(func, secureContext) {
        let _func = func;
        let isGenericType = false;
        if (_func === null || _func === undefined) {
            throw new Error(`The func argument is null or undefined.`);
        }
        if (typeof _func === 'string') {
            if (Reflection.isEmptyString(_func)) {
                throw new Error('The func argument is an empty string.');
            }
            if (!Bag.get(_func)) {
                throw new Error(`could not find type: ${_func}`);
            }
            const [match] = /\<[a-BA-Z-0-9]+\>/g.test(_func);
            if (match) {
                isGenericType = true;
                _func = _func.replace(/\<[a-BA-Z-0-9]+\>/g, '');
            }
            _func = jsTypeMapping.get(_func);
        }
        if (Array.isArray(_func)) {
            _func = _func[0];
            isGenericType = true;
        }
        if (typeof _func === 'function') {
            const isClass = Reflection.isClass(_func);
            if (typeof _func !== 'function') {
                throw new Error(`The func argument is not a function, or is an invalid typed array`);
            }
            if (jsTypeClassMapping.has(_func)) {
                const Class = jsTypeClassMapping.get(_func);
                const defaultValue = jsTypeDefaultValues.get(_func);
                return new Class(_func, isArray, defaultValue);
            } else {
                return new UnkownJavaScriptType(_func, isArray, Unknown);
            }
        } else {
            throw new Error('The func argument is not a string or a function.');
        }
        super(`Id: b5f0f7a4-0de3-4786-b5db-b042135e2227, name: ${_funcName}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            Bag.setProperty(this, secureContext, new Property('jsType', _jsType));
            if (targetClass === Type) {
                Bag.setState(this, secureContext, State.HYDRATE);
            }
        }
    }
    /**
     * @returns { JavaScriptType }
    */
    get jsType() {
        return this.getPropertyValue({ jsType: null });
    }
}