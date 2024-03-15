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
        if (Class.toString().indexOf(`class ${Class.name}`) > -1) {
            classes.push(Class);
        }
        const proto = Object.getPrototypeOf(Class);
        if (!proto) {
            return [];
        }
        return Reflection.getExtendedClasses.call(this, proto).concat(classes);
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
        const isCtorClass = obj.constructor
            && obj.constructor.toString().substring(0, 5) === 'class'
        if (obj.prototype === undefined) {
            return isCtorClass
        }
        const isPrototypeCtorClass = obj.prototype.constructor
            && obj.prototype.constructor.toString
            && obj.prototype.constructor.toString().substring(0, 5) === 'class'
        return isCtorClass || isPrototypeCtorClass
    }
}