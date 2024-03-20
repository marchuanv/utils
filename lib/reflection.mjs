
import { GUID } from '../registry.mjs';
class ClassId extends GUID { }
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
        if (Class !== undefined && Reflection.isClass(Class)) {
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
     * @param { class } expectedClass
     * @return { Boolean }
    */
    static hasExtendedClass(Class, expectedClass) {
        const classes = Reflection.getExtendedClasses.call(this, Class);
        return classes.find(c => c === expectedClass) !== undefined;
    }
    /**
     * Check if an obj is a class
     * @param { Object } obj
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
                return isCtorClass
            }
        }
        const isPrototypeCtorClass = obj.prototype.constructor
            && obj.prototype.constructor.toString
            && obj.prototype.constructor.toString().substring(0, 5) === 'class'
        return isCtorClass || isPrototypeCtorClass
    }
    /**
     * @param { class } Class
     * @returns { Array<{ classId: GUID, propertyId: GUID, Class: class, name: String, isMethod: Boolean, isProperty: Boolean, isGetter: Boolean, isSetter: Boolean }> }
    */
    static getClassMetadata(Class) {
        if (!Reflection.isClass(Class)) {
            throw new Error('The Class argument is not a class.');
        }
        const keys = Reflect.ownKeys(Class.prototype);
        return keys.map(key => {
            const descriptor = Reflect.getOwnPropertyDescriptor(Class.prototype, key);
            const isGetter = descriptor.get ? true : false;
            const isSetter = descriptor.set ? true : false;
            let isMethod = true;
            let isProperty = false;
            if (isGetter || isSetter) {
                isProperty = true;
            }
            if (isProperty) {
                isMethod = false;
            }
            const classId = new ClassId({ Class });
            const propertyId = new ClassId({ descriptor });
            return {
                classId,
                propertyId,
                Class,
                name: key,
                isSetter,
                isGetter,
                isMethod,
                isProperty
            };
        });
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
     * @param { Object | String } type
    */
    static isPrimitiveType(type) {
        if (type === undefined) {
            return true;
        }
        if (typeof type === 'string') {
            const _typeStr = type.toLowerCase();
            return Reflection.getPrimitiveTypes().some(pt => pt.name.toLowerCase() === _typeStr);
        } else {
            return Reflection.getPrimitiveTypes().some(pt => pt.type === type);
        }
    }
    /**
     * @returns { Array<{name: String, type: Object}> }
    */
    static getPrimitiveTypes() {
        return [
            { name: 'String', type: String },
            { name: 'Boolean', type: Boolean },
            { name: 'BigInt', type: BigInt },
            { name: 'Number', type: Number },
            { name: 'null', type: null },
            { name: 'Array', type: Array },
            { name: 'Object', type: Object },
            { name: 'undefined', type: undefined }
        ];
    }
    /**
     * @param { class } Class
     * @param { String } propertyName
     * @param { Array<{ order: Number, variable: String }> } beforeConditions
     * @param { Array<{ order: Number, variable: String }> } afterConditions
     * @returns { { classId: GUID, propertyId: GUID, Class: class, name: String, isGetter: Boolean, isSetter: Boolean, propertyType: class } | undefined }
    */
    static getClassProperty(Class, propertyName, beforeConditions = [], afterConditions = []) {
        const properties = Reflection.getClassMetadata(Class).filter(x => x.isProperty);
        const found = properties.find(x => x.name === propertyName);
        if (found) {
            const { name, isGetter, isSetter, classId, propertyId } = found;
            const { get, set } = Reflect.getOwnPropertyDescriptor(Class.prototype, name);
            const { expression, propertyType } = Reflection.resolvePropertyType(get, set, beforeConditions, afterConditions);
            if (!propertyType) {
                console.log('expression: ', expression);
            }
            return {
                classId,
                propertyId,
                Class,
                name,
                isGetter,
                isSetter,
                propertyType
            };
        } else {
            throw new Error(`${propertyName} not found.`);
        }
    }
    /**
     * @param { Function } get
     * @param { Function } set
     * @param { Array<{ order: Number, variable: String }> } beforeConditions
     * @param { Array<{ order: Number, variable: String }> } afterConditions
     * @returns { class | undefined } PropertyType
    */
    static resolvePropertyType(get, set, beforeConditions, afterConditions) {
        let bodyScript = `${get ? get.toString() : ''}${set ? set.toString() : ''}`;
        bodyScript = bodyScript.replace(/\r\n/g, '').replace(/\n/g, '').replace(/\s/g, '');
        const _beforeConditions = beforeConditions.sort((x, y) => x.order - y.order);
        const _afterConditions = afterConditions.sort((x, y) => x.order - y.order);
        const beforeConditionsStr = _beforeConditions.reduce((str, { variable }) => `${str}${variable}`, '');
        const afterConditionsStr = _afterConditions.reduce((str, { variable }) => `${str}${variable}`, '');
        const regEx = new RegExp(`(?<=${beforeConditionsStr})[a-zA-Z0-9]+(?=${afterConditionsStr})`);
        let results = regEx.exec(bodyScript);
        if (results) {
            results = results[0];
        }
        return {
            propertyType: results,
            expression: regEx.toString()
        };
    }
    /**
     * @param { Object } typeA
     * @param { Object } typeB
     * @returns { Boolean }
    */
    static typeMatch(typeA, typeB) {
        if (typeA === null && typeB !== null) {
            return false;
        }
        if (typeB === null && typeA !== null) {
            return false;
        }
        if (typeA === undefined && typeB !== undefined) {
            return false;
        }
        if (typeB === undefined && typeA !== undefined) {
            return false;
        }
        if (Reflection.isClass(typeA) && Reflection.isClass(typeB)) {
            let typeAClasses = Reflection.getExtendedClasses(typeA);
            let typeBClasses = Reflection.getExtendedClasses(typeB);
            if (!typeAClasses || typeAClasses.length === 0) {
                typeAClasses = Reflection.getExtendedClasses(typeA.constructor);
            }
            if (!typeBClasses || typeBClasses.length === 0) {
                typeAClasses = Reflection.getExtendedClasses(typeB.constructor);
            }
            if (typeAClasses.find(x => x === typeB || x === typeB.constructor) || typeBClasses.find(x => x === typeA || x === typeA.constructor)) {
                return true;
            }
        }
        if (Reflection.isPrimitiveType(typeA) && Reflection.isPrimitiveType(typeB)) {
            if (typeA === typeB) {
                return true;
            }
        }
        if (Reflection.isPrimitiveType(typeA.constructor) && Reflection.isPrimitiveType(typeB)) {
            if (typeA.constructor === typeB) {
                return true;
            }
        }
        if (Reflection.isPrimitiveType(typeA) && Reflection.isPrimitiveType(typeB.constructor)) {
            if (typeA === typeB.constructor) {
                return true;
            }
        }
        return false;
    }
}