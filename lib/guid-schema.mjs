import {
    Schema,
    TypeInfo,
    UUID
} from '../registry.mjs';
export class GUIDSchema extends Schema {
    /**
     * @param { Array<{ name: String, typeInfo: TypeInfo }> } properties
    */
    constructor(properties = []) {
        super(properties.concat([{
            name: 'Id',
            typeInfo: new TypeInfo(UUID, true)
        }]));
    }
}