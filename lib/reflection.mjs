
export function NULL() { return null; }
export function UNDEFINED() { return undefined; }

const commonTypeMap = new Map();
commonTypeMap.set('string', String);
commonTypeMap.set('number', Number);
commonTypeMap.set('bigint', BigInt);
commonTypeMap.set('boolean', Boolean);
commonTypeMap.set('object', Object);
commonTypeMap.set('function', Function);
commonTypeMap.set('func', Function);
export class Reflection {
    /**
     * @param { prototype } proto
     * @param { prototype } expectedProto
     * @return { Boolean }
    */
    static hasPrototype(proto, expectedProto) {
        const prototypes = Reflection.getPrototypes.call(this, proto);
        return prototypes.find(proto => proto === expectedProto) !== undefined;
    }
    /**
     * @param { prototype } prototype
     * @return { Array<prototype> }
    */
    static getPrototypes(prototype) {
        let prototypes = [prototype];
        const proto = Object.getPrototypeOf(prototype);
        if (!proto) {
            return [];
        }
        return Reflection.getPrototypes.call(this, proto).concat(prototypes);
    }
    /**
     * @param { class } Class
     * @return { Array<class> }
    */
    static getExtendedClasses(Class) {
        let classes = [];
        if (Reflection.isClass(Class)) {
            if (typeof Class === 'object') {
                Class = Class.constructor;
            }
            if (Class.name) {
                classes.push(Class);
            }
            const proto = Object.getPrototypeOf(Class);
            if (proto) {
                classes = Reflection.getExtendedClasses.call(this, proto).concat(classes);
            }
        }
        return classes;
    }
    /**
     * @param { class } Class
     * @param { class } extendedClass
     * @return { Boolean }
    */
    static hasExtendedClass(Class, extendedClass) {
        if (!Reflection.isClass.call(this, extendedClass)) {
            return false;
        }
        const classes = Reflection.getExtendedClasses.call(this, Class);
        return classes.find(c => c === extendedClass) !== undefined;
    }
    /**
     * Check if an obj is a class
     * @param { Object | Function } obj
     * @returns { Boolean }
    */
    static isClass(obj) {
        if (obj === null || obj === undefined || !(typeof obj === 'object' || typeof obj === 'function')) {
            return false;
        }
        let isCtorClass = false;
        if (obj.constructor) {
            isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === 'class'
            if (obj.prototype === undefined) {
                return isCtorClass;
            }
        }
        const isPrototypeCtorClass = obj.prototype.constructor
            && obj.prototype.constructor.toString
            && obj.prototype.constructor.toString().substring(0, 5) === 'class'
        return isCtorClass || isPrototypeCtorClass
    }
    /**
     * @param { Object } str
     * @return { Boolean }
    */
    static isEmptyString(str) {
        const _isAString = typeof str === 'string';
        if (_isAString) {
            const results = str.replace(/\s/g, '');
            return results === '';
        } else {
            return false;
        }
    }
    /**
     * @param { Object } objA
     * @param { Object } objB
     * @returns { Boolean }
    */
    static compareObjectKeys(objA, objB) {
        var aKeys = Object.keys(objA).sort();
        var bKeys = Object.keys(objB).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }
    /**
     * @param { Object } prototype
     * @returns { Array<{  memberKey: String, isProperty: Boolean, isGetterProperty: Boolean, isSetterProperty: Boolean, isMethod: Boolean, method: Function, isConstructor: Boolean }> }
    */
    static getMemberDescriptors(prototype) {
        const descriptors = [];
        let memberKeys = Reflect.ownKeys(prototype);
        memberKeys = memberKeys.concat(Object.keys(prototype));
        for (const memberKey of memberKeys) {
            const descriptor = Reflect.getOwnPropertyDescriptor(prototype, memberKey);
            if (descriptor) {
                const isGetterProperty = descriptor.get ? true : false;
                const isSetterProperty = descriptor.set ? true : false;
                const isProperty = isGetterProperty || isSetterProperty;
                let isMethod = true;
                let isConstructor = false;
                if (isGetterProperty || isSetterProperty) {
                    isMethod = false;
                } else {
                    isMethod = true;
                    if (memberKey === 'constructor') {
                        isConstructor = true;
                    }
                }
                let method = null;
                if (isMethod) {
                    method = descriptor.value;
                } else if (isProperty) {
                    if (isGetterProperty) {
                        method = descriptor.get;
                    } else if (isSetterProperty) {
                        method = descriptor.set;
                    }
                }
                descriptors.push({
                    memberKey,
                    isProperty,
                    isGetterProperty,
                    isSetterProperty,
                    isMethod,
                    method,
                    isConstructor
                });
            }
        }
        return descriptors;
    }
    /**
     * @param { Object } obj
     * @param { Array<Function> } expected
     * @returns { Boolean }
    */
    static isTypeOf(obj, expected) {
        if (obj === undefined) {
            return false;
        }
        if (expected === undefined) {
            return false;
        }
        let _expected = [];
        if (Array.isArray(expected)) {
            if (expected.some(exp => exp === undefined || exp === null || typeof exp !== 'function')) {
                return false;
            }
            _expected = expected;
        } else {
            if (expected === undefined || expected === null || typeof expected !== 'function') {
                return false;
            }
            _expected.push(expected);
        }
        const objType = typeof obj;
        if (commonTypeMap.has(objType)) {
            const objMap = commonTypeMap.get(objType);
            if (objMap === Object) {
                return _expected.some(type => obj instanceof type);
            } else if (objMap === Function) {
                if (_expected.some(type => type === objMap)) {
                    return true;
                } else if (_expected.some(type => type === obj)) {
                    return true;
                } else if (_expected.some(type => Reflection.hasExtendedClass(obj, type))) {
                    return true;
                }
            } else {
                return _expected.some(type =>
                    commonTypeMap.has(type.name.toLowerCase()) &&
                    commonTypeMap.get(type.name.toLowerCase()) === commonTypeMap.get(typeof obj)
                );
            }
        }
        return false;
    }
}