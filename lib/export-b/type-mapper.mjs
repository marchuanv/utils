import { Bag, State } from "../export-a/bag.mjs";
import { Reflection } from "../reflection.mjs";
import { UUID } from "../uuid.mjs";
import { BagState } from "./bag-state.mjs";
const secureContext = Bag.getSecureContext();
export class JSType extends BagState {
    /**
     * @param { UUID } Id
     * @param { JSTypeMapping } jsTypeMapping
     * @param { Function } func
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
    */
    constructor(Id, jsTypeMapping, func = null, defaultValue = null, isGenericType = false) {
        if (!(Id instanceof UUID)) {
            throw new Error(`The Id argument is not an instance of ${UUID.name}.`);
        }
        if (!(jsTypeMapping instanceof JSTypeMapping)) {
            throw new Error(`The jsTypeMapping argument is not an instance of ${JSTypeMapping.name}.`);
        }
        super(`Id: ${Id}, MapId: ${jsTypeMapping}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            if (typeof func !== 'function') {
                throw new Error('The func argument is not a function.');
            }
            if (typeof isGenericType !== 'boolean') {
                throw new Error('The isGenericType argument is not a boolean.');
            }
            if (Reflection.isClass(func)) {
                this.setPropertyValue({ isClass: true });
            } else {
                this.setPropertyValue({ isClass: false });
            }
            if (defaultValue === undefined) {
                throw new Error('The defaultValue argument is undefined.');
            }
            this.setPropertyValue({ name: func.name });
            this.setPropertyValue({ func });
            this.setPropertyValue({ defaultValue });
            this.setPropertyValue({ isGenericType });
            this.setState(State.HYDRATE);
        }
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getPropertyValue({ name: null });
    }
    /**
     * @returns { Function }
    */
    get func() {
        return this.getPropertyValue({ func: null });
    }
    /**
     * @returns { Object }
    */
    get defaultValue() {
        return this.getPropertyValue({ defaultValue: null });
    }
    /**
     * @returns { Boolean }
    */
    get isClass() {
        return this.getPropertyValue({ isClass: null });
    }
    /**
     * @returns { Boolean }
    */
    get isGenericType() {
        return this.getPropertyValue({ isGenericType: null });
    }
}
export class JSTypeMapping extends BagState {
    /**
     * @param { String } functionName
    */
    constructor(functionName) {
        if (typeof functionName !== 'string') {
            throw new Error('The functionName argument is not a string.');
        }
        super(`Id: 28904f58-cd44-4909-87f5-9c4b11617f82, Function: ${functionName}`, secureContext);
        if (this.isAtState(State.CONSTRUCT)) {
            this.setState(State.HYDRATE);
        }
    }
    /**
     * @param { Function } funcA
     * @param { Function } funcB
     * @param { Object } defaultValue
     * @param { Boolean } isGenericType
    */
    static register(funcA, funcB, defaultValue, isGenericType = false) {
        if (typeof funcA !== 'function') {
            throw new Error('The funcA argument is not a function.');
        }
        if (typeof funcB !== 'function') {
            throw new Error('The funcB argument is not a function.');
        }
        if (typeof isGenericType !== 'boolean') {
            throw new Error('The isGenericType argument is not a boolean.');
        }
        ensureMappedType([funcA, funcB], defaultValue, isGenericType);
    }
    /**
     * @param { { funcA: Function | String | undefined, funcB: Function | String | undefined } } criteria
     * @returns {{ jsTypeA: JSType, jsTypeB: JSType }}
    */
    static get(criteria) {
        const { funcA, funcB } = criteria;
        const isFuncAValid = funcA && (typeof funcA === 'function' || typeof funcA === 'string');
        const isFuncBValid = funcB && (typeof funcB === 'function' || typeof funcB === 'string');
        if (isFuncAValid && !isFuncBValid) {
            return ensureMappedType([funcA]);
        } else if (isFuncBValid && !isFuncAValid) {
            return ensureMappedType([funcB]);
        } else if (isFuncAValid && isFuncBValid) {
            return ensureMappedType([funcA, funcB]);
        } else {
            throw new Error('func and Class criteria is null or undefined.');
        }
    }
}
/**
 * @param { Array<String|Function> } functions
 * @param { Object } defaultValue
 * @param { Boolean } isGenericType
 * @returns {{ jsTypeA: JSType, jsTypeB: JSType }}
*/
function ensureMappedType(functions, defaultValue = null, isGenericType = false) {
    const typeAId = new UUID('2aa771b2-6313-4114-b78e-c0d71b70762e');
    const typeBId = new UUID('ae183a07-a819-4e87-8677-ccac7e2ceb29');
    if (functions.length === 1) {
        const [func] = functions;
        const functionName = typeof func === 'function' ? func.name : func;
        const mapping = new JSTypeMapping(functionName);
        const jsTypeA = new JSType(typeAId, mapping);
        const jsTypeB = new JSType(typeBId, mapping);
        return { jsTypeA, jsTypeB };
    } else if (functions.length === 2) {
        const [funcA, funcB] = functions;
        let functionName = typeof funcA === 'function' ? funcA.name : funcA;
        let mapping = new JSTypeMapping(functionName);
        let jsTypes = [];
        jsTypes.push(new JSType(typeAId, mapping, funcA, defaultValue, isGenericType));
        jsTypes.push(new JSType(typeBId, mapping, funcB, defaultValue, isGenericType));
        functionName = typeof funcB === 'function' ? funcB.name : funcB;
        mapping = new JSTypeMapping(functionName);
        jsTypes.push(new JSType(typeAId, mapping, funcA, defaultValue, isGenericType));
        jsTypes.push(new JSType(typeBId, mapping, funcB, defaultValue, isGenericType));
        jsTypes = jsTypes.reduce((_jsTypes, jsType) => {
            if (!_jsTypes.find(x => x.Id === jsType.Id)) {
                _jsTypes.push(jsType);
            }
            return _jsTypes;
        }, []);
        const [jsTypeA, jsTypeB] = jsTypes;
        return { jsTypeA, jsTypeB };
    }
}