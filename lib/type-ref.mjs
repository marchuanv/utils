import { NamespaceReference, Reference } from '../registry.mjs';
export class TypeReference extends Reference {
    /**
     * @param { NamespaceReference } nsRef
     * @param { String } typeName
    */
    constructor(nsRef, typeName) {
        if (!nsRef) {
            throw new Error('nsRef argument is null or undefined')
        }
        if (!(nsRef instanceof NamespaceReference)) {
            throw new Error(`nsRef argument is not an instance of ${NamespaceReference.name}`);
        }
        if (!typeName) {
            throw new Error('typeName argument is null, undefined or empty.')
        }
        if (typeof typeName !== 'string') {
            throw new Error(`typeName argument is not a ${String.name}`)
        }
        if (Reference.find({ typeName })) {
            throw new Error(`type: ${typeName} already exist in the metadata`)
        }
        super(nsRef.Id);
        super.metadata.typeName = typeName;
    }
    toString() {
        return super.metadata.typeName;
    }
}