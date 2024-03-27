export class Schema extends Array {
    /**
     * @param { Array<{ key: String, type: Object }> } properties
    */
    constructor(properties) {
        if (new.target === Schema) {
            throw new Error(`${Schema.name} is an abstract class.`);
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