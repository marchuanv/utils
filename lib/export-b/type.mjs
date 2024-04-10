import {
    Bag,
    DataSchema,
    Property,
    Reflection,
    UUID
} from "../../registry.mjs";
export function UNKNOWN() { }
export function ANY() { }
const secureContext = Bag.getSecureContext();
export class Type extends DataSchema {
    /**
     * @param { String } name
     * @param { Function | Array<Function> } func
    */
    constructor(name = UNKNOWN.name, func = UNKNOWN, context) {
        Bag.inherit(context, secureContext);
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
        //type lookup
        super();
        this._typeId = new UUID(`Id: b5f0f7a4-0de3-4786-b5db-b042135e2227, name: ${_funcName}`);
        if (Bag.hasUUID(this._typeId, secureContext)) {
            return Bag.get(this._typeId, secureContext);
        } else {
            Bag.set(this._typeId, secureContext, this);
            Bag.setProperty(this._typeId, secureContext, new Property('name', _funcName));
            Bag.setProperty(this._typeId, secureContext, new Property('func', _func));
            Bag.setProperty(this._typeId, secureContext, new Property('isArray', isArray));
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return Bag.getProperty(this._typeId, secureContext, { name: null });
    }
    /**
     * @returns { Function }
    */
    get func() {
        return Bag.getProperty(this._typeId, secureContext, { func: null });
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        return Bag.getProperty(this._typeId, secureContext, { isArray: null });
    }
}