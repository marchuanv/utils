import { Member, Schema } from "../../registry.mjs";
export class MemberSchema extends Schema {
    /**
     * @param { Member } classMember
    */
    constructor(classMember) {
        if (!classMember.isClass) {
            throw new Error('member is not a class');
        }
        const properties = {};
        classMember.reset();
        while(classMember.next) {
            const child = classMember.child;
            if (child.isCtor) {
                for(const param of child.parameters) {
                    properties[param.name] = {};
                    const property = properties[param.name];
                    const typeName = param.type.name.toLowerCase();
                    property['$ref'] = `/${typeName}`;
                }
            }
        }
        super(classMember.name, classMember.type, properties);
    }
}