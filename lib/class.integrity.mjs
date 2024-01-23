import { MethodMember, Schema } from "../registry.mjs";
export class ClassIntegrity {
    /**
     * @param { MethodMember } ctorMethodMember
    */
    constructor(ctorMethodMember) {
        const targetClass = new.target;
        if (targetClass === ClassIntegrity.prototype || targetClass === ClassIntegrity) {
            throw new Error(`${ClassIntegrity.name} class is abstract`);
        }
        const existingSchema = Schema.getSchema(ctorMethodMember.typeDefinition);
        if (!existingSchema) {
            const properties = {};
            for (const param of ctorMethodMember.parameters) {
                properties[param.name] = {};
                const property = properties[param.name];
                const typeDefinition = param.typeDefinition;
                let paramSchema = Schema.getSchema(typeDefinition);
                if (!paramSchema) {
                    paramSchema = Schema.createSchema(typeDefinition, {});
                }
                property['$ref'] = paramSchema.url;
            }
            Schema.createSchema(ctorMethodMember.typeDefinition, properties);
        }
    }
    async validate() {
        const existingSchema = Schema.getSchema(this.ctor.typeDefinition);
        const parameters = this.ctor.parameters;
        const obj = parameters.reduce((_obj, param) => {
            _obj[param.name] = param.value;
            return _obj;
        }, {});
        await existingSchema.validate(obj);
    }
}