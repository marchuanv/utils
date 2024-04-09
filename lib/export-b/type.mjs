import {
    Bag,
    DataSchema,
    Properties,
    Property,
    Reflection,
    TypeSchema,
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
        super();
        const typeId = new UUID(`Id: b5f0f7a4-0de3-4786-b5db-b042135e2227, name: ${_funcName}`, secureContext);
        if (Bag.has(typeId, secureContext)) {
            return Bag.get(typeId, secureContext);
        } else {
            Bag.set(typeId, secureContext, this);
        }
        this._propertiesId = new UUID(null, secureContext);
        Bag.set(this._propertiesId, secureContext, new Properties([
            new Property('name', _funcName),
            new Property('func', _func),
            new Property('isArray', isArray),
        ]));
        Object.freeze(this);
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = Bag.get(this._propertiesId, secureContext, TypeSchema.prototype);
        return name;
    }
    /**
     * @returns { Function }
    */
    get func() {
        const { func } = Bag.get(this._propertiesId, secureContext, TypeSchema.prototype);
        return func;
    }
    /**
     * @returns { Boolean }
    */
    get isArray() {
        const { isArray } = Bag.get(this._propertiesId, secureContext, TypeSchema.prototype);
        return isArray;
    }
}