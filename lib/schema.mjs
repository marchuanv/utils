export class Schema extends Array {
    /**
     * @param { Array<{ key: String, type: Object }> } properties
    */
    constructor(properties) {
        const targetClass = new.target;
        if (targetClass === Schema) {
            throw new Error(`${Schema.name} is an abstract class.`);
        }
        if (targetClass === null || targetClass === undefined) {
            throw new Error(`${Schema.name} should be constructed using the new keyword.`);
        }
        if (
            properties === null ||
            properties === undefined ||
            !Array.isArray(properties) ||
            properties.length === 0 ||
            typeof properties[0].key !== 'string' ||
            typeof properties[0].type !== 'function'
        ) {
            throw new Error(`The properties argument is null, undefined, not an array, an empty array or contains invalid elements.`);
        }
        super();
        properties.forEach(x => super.push(x));
    }
    /**
     * @returns { Object }
    */
    get empty() {
        const emptyData = {};
        for (const { key, type } of this) {
            emptyData[key] = type;
        }
        Object.seal(emptyData);
        return emptyData;
    }
}