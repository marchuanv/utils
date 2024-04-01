
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
                return isCtorClass
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
     * @param { Object | String } type
     * @returns {{ name: String, type: Object, default: Object  }}
    */
    static getPrimitiveType(type) {
        if (type === undefined) {
            return true;
        }
        const primitives = Reflection.getPrimitiveTypes();
        let found = null;
        let typeStr = null;
        if (typeof type === 'string') {
            typeStr = type.toLowerCase();
            found = primitives.find(pt => pt.type.find(t => t.name.toLowerCase() === typeStr));
            if (found) {
                found = found.type.find(t => t.name === typeStr);
            }
        } else {
            found = primitives.find(pt => pt.type.find(t => t === type));
            if (found) {
                found = found.type.find(t => t === type);
            }
        }
        if (!found) {
            throw new Error('type not found.');
        }
        return found;
    }
    /**
     * @param { Object | String } type
     * @returns { Boolean }
    */
    static isPrimitiveType(type) {
        if (type === undefined) {
            return true;
        }
        const primitives = Reflection.getPrimitiveTypes();
        if (typeof type === 'string') {
            const _typeStr = type.toLowerCase();
            return primitives.some(pt => pt.name.toLowerCase() === _typeStr);
        } else {
            return primitives.some(pt => pt.type.find(t => t === type));
        }
    }
    /**
     * @returns { Array<{ name: String, type: Object, default: Object }> }
    */
    static getPrimitiveTypes() {
        return [
            { name: 'String', type: [String], default: '' },
            { name: 'Boolean', type: [Boolean], default: false },
            { name: 'BigInt', type: [BigInt], default: 0 },
            { name: 'Number', type: [Number], default: 0 },
            { name: 'null', type: [null], default: null },
            { name: 'Array', type: [Object, Array], default: [] },
            { name: 'Object', type: [Object], default: {} },
            { name: 'undefined', type: [undefined], default: undefined },
            { name: 'Date', type: [Object, Date], default: new Date()},
            { name: 'RegExp', type: [Object, RegExp ], default: /\s/g },
        ];
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
        if (typeA === typeB) {
            return true;
        }
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
            if (typeA.constructor === typeB.constructor) {
                return true;
            }
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
        if (Reflection.isPrimitiveType(typeA.constructor) && Reflection.isPrimitiveType(typeB.constructor)) {
            if (typeA.constructor === typeB.constructor) {
                return true;
            }
        }
        return false;
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
}