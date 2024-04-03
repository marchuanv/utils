import {
    Bag,
    NULL,
    Reflection,
    Schema,
    UNDEFINED,
    UUID
} from "../registry.mjs";
export function UNKNOWN() { }
export function ANY() { }
const secureContext = Bag.getSecureContext();
class TypeSchema extends Schema {
    constructor() {
        super([]);
    }
}
export class Type {
    /**
     * @param { String } name
     * @param { Function | Array<Function> } func
    */
    constructor(name = UNKNOWN.name, func = UNKNOWN) {
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
        this._Id = new UUID(_funcName, secureContext);
        if (Bag.has(this._Id, secureContext)) {
            return Bag.get(this._Id, secureContext, Type.prototype);
        } else {
            Bag.set(this._Id, secureContext, this, new TypeSchema());
            Bag.setData(this._Id, secureContext, {
                name: _funcName,
                func: _func,
                isArray
            });
        }
        Object.freeze(this);
    }
    /**
     * @returns { UUID } universally unique identifier
    */
    get Id() {
        return this._Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = Bag.getData(this.Id, secureContext, TypeSchema.prototype);
        return name;
    }
    /**
     * @returns { Function }
    */
    get func() {
        const { func } = Bag.getData(this.Id, secureContext, TypeSchema.prototype);
        return func;
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        const { isArray } = Bag.getData(this.Id, secureContext, TypeSchema.prototype);
        return isArray;
    }
}
new Type(null, String);
new Type(null, Boolean);
new Type(null, BigInt);
new Type(null, Number);
new Type(null, NULL);
new Type(null, UNDEFINED);
new Type(null, Array);
new Type(null, Date);
new Type(null, RegExp);