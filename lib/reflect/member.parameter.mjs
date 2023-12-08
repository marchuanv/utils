import { randomUUID, TypeMapper } from '../../registry.mjs';
export class MemberParameter {
    /**
     * @param { Object } field
     * @param { TypeMapper } typeMap
    */
    constructor(field, typeMap) {
        this.Id = randomUUID();
        this.name = Object.keys(field)[0];
        this.value = field[this.name];
        this.typeMap = typeMap;
    }
}