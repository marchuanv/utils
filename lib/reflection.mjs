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
        if (obj === null || obj === undefined) {
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
     * @returns { Array<{ name: String, isMethod: Boolean, isProperty: Boolean, isGetter: Boolean, isSetter: Boolean }> }
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
            return {
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
            throw new Error(`The str argument is not a string.`);
        }
    }
}