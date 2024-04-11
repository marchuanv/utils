import {
    Bag,
    BagState,
    Property,
    Reflection,
    SecureContext,
    State
} from "../../registry.mjs";
export function UNKNOWN() { }
export function ANY() { }
const secureContext = Bag.getSecureContext();
export class Type extends BagState {
    /**
     * @param { String } name
     * @param { Function | Array<Function> } func
     * @param { SecureContext } context
    */
    constructor(name = UNKNOWN.name, func = UNKNOWN, context) {
        if (context === null || context === undefined || !(context instanceof SecureContext)) {
            throw new Error(`The context argument is null, undefined, or not an instance of ${SecureContext.name}.`);
        }
        let _funcName = name;
        let _func = func;
        let isArray = false;
        if (_funcName === null && _func === null) {
            throw new Error(`The name and func arguments are null.`);
        }
        if (_func !== null && (typeof _func === 'function' || (Array.isArray(_func) && typeof _func[0] === 'function'))) {
            if (Array.isArray(_func)) {
                _func = _func[0];
                _funcName = `Array<${_func.name}>`;
                isArray = true;
            } else if (_func === Array) {
                isArray = true;
                _func = ANY;
                _funcName = `Array<${_func.name}>`;
            } else {
                _funcName = _func.name;
            }
        }
        if (_funcName === null || typeof _funcName !== 'string' || Reflection.isEmptyString(_funcName)) {
            throw new Error(`The name argument is null, not a string or is an empty string.`);
        }
        Bag.inherit(context, secureContext);
        super(`Id: b5f0f7a4-0de3-4786-b5db-b042135e2227, name: ${_funcName}`, context);
        if (this.isAtState(State.CONSTRUCT)) {
            Bag.setProperty(this, secureContext, new Property('name', _funcName));
            Bag.setProperty(this, secureContext, new Property('func', _func));
            Bag.setProperty(this, secureContext, new Property('isArray', isArray));
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return Bag.getProperty(this, secureContext, { name: null });
    }
    /**
     * @returns { Function }
    */
    get func() {
        return Bag.getProperty(this, secureContext, { func: null });
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        return Bag.getProperty(this, secureContext, { isArray: null });
    }
}