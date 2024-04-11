import {
    Property,
    Serialiser,
    TypeInfo
} from "../../registry.mjs";
export class TypeInfoSchema extends TypeInfo {
    /**
     * @param { Object } data
    */
    validate(data) {
        let objKeys = Object.keys(data);
        const prototype = Object.getPrototypeOf(data);
        if (prototype) {
            objKeys = objKeys.concat(Reflect.ownKeys(prototype));
        }
        if (objKeys.length === 0) {
            throw new Error(`data to verify does not have any properties.`);
        }
        for (const typeMemberInfoSchema of super.members.filter(x => x.isGetterProperty)) {
            const keyMatch = objKeys.find(k => k === typeMemberInfoSchema.name);
            if (keyMatch === undefined || keyMatch === null) {
                throw new Error(`data does not have the ${typeMemberInfoSchema.name} property.`);
            }
            const property = new Property(typeMemberInfoSchema.name, data[keyMatch]);
            typeMemberInfoSchema.validate(property);
        }
    }
    /**
     * @param { Object } data
    */
    serialise(data) {
        this.validate(data);
        return Serialiser.serialise(data);
    }
}