import { randomUUID, TypeMapper } from '../../registry.mjs';
export class MemberParameter {
    /**
     * @param { Object } field
     * @param { TypeMapper } map
    */
    constructor(field, map) {
        this.Id = randomUUID();
        this.name = Object.keys(field)[0];
        this.value = field[this.name];
        this.type = map.info.type;
        this.associatedType = map.info.associatedType;
    }
}