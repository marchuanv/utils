import { Bag, State } from "../export-a/bag.mjs";
import { BagState } from "./bag-state.mjs";

function Unknown() { }
function Undefined() { }
function ANY() { }
function Class() { }
function Null() { }

jsTypeDefaultValues.set(BigInt, 0);
jsTypeDefaultValues.set(String, '');
jsTypeDefaultValues.set(Number, 0);
jsTypeDefaultValues.set(Object, {});
jsTypeDefaultValues.set(Date, new Date());
jsTypeDefaultValues.set(Boolean, false);
jsTypeDefaultValues.set(Array, []);
jsTypeDefaultValues.set(Set, new Set());
jsTypeDefaultValues.set(WeakMap, new WeakMap());
jsTypeDefaultValues.set(WeakSet, new WeakSet());
jsTypeDefaultValues.set(Unknown, Unknown);
jsTypeDefaultValues.set(Undefined, undefined);
jsTypeDefaultValues.set(ANY, {});
jsTypeDefaultValues.set(Class, {});
jsTypeDefaultValues.set(Null, null);

const secureContext = Bag.getSecureContext();

export class JSTypeMap extends BagState {
    /**
     * @param { Function } func
     * @param { Function } Class
     * @param { Object } defaultValue
    */
    constructor(func, Class, defaultValue) {
        if (typeof func !== 'function') {
            throw new Error('The func argument is not a function.');
        }
        if (typeof Class !== 'function') {
            throw new Error('The Class argument is not a function.');
        }
        if (typeof defaultValue !== 'object') {
            throw new Error('The defaultValue argument is not an object.');
        }
        super(`Id: 984272e6-5c6e-417e-a7c4-33b61145b0d9, FunctionName: ${func.name}, ClassName: ${Class.name}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            Bag.setProperty(this, secureContext, { funcName: func.name });
            Bag.setProperty(this, secureContext, { className: Class.name });
            Bag.setProperty(this, secureContext, { defaultValue });
            Bag.setState(this, State.HYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    static funcName() {
        return this.getPropertyValue({ funcName: null });
    }
    /**
     * @returns { String }
    */
    static className() {
        return this.getPropertyValue({ className: null });
    }
    /**
     * @returns { Object }
    */
    static defaultValue() {
        return this.getPropertyValue({ defaultValue: null });
    }
}

export class JSType extends BagState {
    constructor() {
        super(`Id: df9d9818-6476-48a4-9e21-07b0ecb2971f, Name: ${JSType.name}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            Bag.setState(this, State.HYDRATE);
        }
    }
    /**
     * @param { JSTypeMap } mapping
    */
    set(mapping) {
        Bag.setProperty(this, secureContext, { [mapping.Id]: map });
    }
    /**
     * @param { JSTypeMap } mapping
    */
    get(mapping) {
        return this.getPropertyValue({ [mapping.Id]: null });
    }
    /**
     * @param { Function } func
     * @param { Function } Class
     * @param { Object } defaultValue
    */
    static register(func, Class, defaultValue) {
        const jsType = new JSType();
        jsType.set(new JSTypeMap(func, Class, defaultValue));
    }
    /**
     * @param { { func: Function, Class: Function } } criteria
    */
    static get(criteria) {
        const jsType = new JSType();
        new JSTypeMap(func, Class, defaultValue);
    }
}
class StringType { }
const stringMap = new JSTypeMap(String, StringType, '');

class NumberType { }
const stringMap = new JSTypeMap(Number, NumberType, '');

class NumberJavaScriptType extends JavaScriptType { }
class ObjectJavaScriptType extends JavaScriptType { }
class BooleanJavaScriptType extends JavaScriptType { }
class ArrayJavaScriptType extends JavaScriptType { }
class SetJavaScriptType extends JavaScriptType { }
class WeakMapJavaScriptType extends JavaScriptType { }
class WeakSetJavaScriptType extends JavaScriptType { }
class BigIntJavaScriptType extends JavaScriptType { }
class UnkownJavaScriptType extends JavaScriptType { }
class AnyJavaScriptType extends JavaScriptType { }
class UndefinedJavaScriptType extends JavaScriptType { }
class ClassJavaScriptType extends JavaScriptType { }
const jsTypeClasses = [
    BigIntJavaScriptType,
    StringJavaScriptType,
    NumberJavaScriptType,
    ObjectJavaScriptType,
    BooleanJavaScriptType,
    ArrayJavaScriptType,
    SetJavaScriptType,
    WeakMapJavaScriptType,
    WeakSetJavaScriptType,
    UnkownJavaScriptType,
    UndefinedJavaScriptType,
    AnyJavaScriptType,
    ClassJavaScriptType
];
for (const func of jsTypeDefaultValues.keys()) {
    jsTypeMapping.set(func.name, func);
    for (const jsTypeClass of jsTypeClasses) {
        if (jsTypeClass.name.toLowerCase().startsWith(func.name.toLowerCase())) {
            jsTypeClassMapping.set(func, jsTypeClass);
        }
    }
}
