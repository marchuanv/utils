import {
    NULL,
    Type,
    UNDEFINED
} from "../../registry.mjs";
export class TypeSchema extends Type {
    /**
     * @param { Object } data
    */
    validate(data) {
        super.validate(data);
    }
}
new TypeSchema(null, String);
new TypeSchema(null, Boolean);
new TypeSchema(null, BigInt);
new TypeSchema(null, Number);
new TypeSchema(null, NULL);
new TypeSchema(null, UNDEFINED);
new TypeSchema(null, Array);
new TypeSchema(null, Date);
new TypeSchema(null, RegExp);