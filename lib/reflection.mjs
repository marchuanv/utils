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
     * @param { class } Class
     * @return { Array<class> }
    */
    static getPrototypes(Class) {
        let prototypes = [Class];
        const proto = Object.getPrototypeOf(Class);
        if (!proto) {
            return [];
        }
        return Reflection.getPrototypes.call(this, proto).concat(prototypes);
    }
}