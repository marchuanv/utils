
export class DataSchema {
    /**
     * @param { Object } data
    */
    serialise(data) {
        if (data === null || data === undefined || typeof data !== 'object' || Object.keys(data).length === 0) {
            throw new Error(`data to serialise is null, undefined, not an object or an empty object.`);
        }
    }
    /**
     * @param { Object } data
    */
    validate(data) {
        if (data === null || data === undefined || typeof data !== 'object' || Object.keys(data).length === 0) {
            throw new Error(`data to validate is null, undefined, not an object or an empty object.`);
        }
    }
}