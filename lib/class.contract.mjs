import { ClassInterface, MethodMember, Schema } from "../registry.mjs";
export class ClassContract {
    /**
     * @param { MethodMember } ctorMethodMember
    */
    constructor(ctorMethodMember) {
        const targetClass = new.target;
        if (targetClass === ClassContract.prototype || targetClass === ClassContract) {
            throw new Error(`${ClassContract.name} class is abstract`);
        }
        const existingSchema = Schema.getSchema(ctorMethodMember.typeDefinition);
        if (!existingSchema) {
            const properties = {};
            for (const param of ctorMethodMember.parameters) {
                properties[param.name] = {};
                const property = properties[param.name];
                const typeDefinition = param.typeDefinition;
                const classInterfaceDep = ClassInterface.find(typeDefinition.Id);
                if (classInterfaceDep) {
                    property['$ref'] = classInterfaceDep.schema.url;
                } else {
                    let schema = Schema.getSchema(typeDefinition);
                    if (!schema) {
                        schema = Schema.createSchema(typeDefinition, {});
                    }
                    property['$ref'] = schema.url;
                }
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