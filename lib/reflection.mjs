export class Reflection {
    /**
     * @param { class } Class
     * @param { class } expectedClass
     * @return { Boolean }
    */
    static hasPrototype(Class, expectedClass) {
        const prototypes = Reflection.getPrototypes.call(this, Class);
        return prototypes.find(proto => proto === expectedClass) !== undefined;
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
}