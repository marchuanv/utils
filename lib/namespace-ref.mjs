import { Reference } from '../registry.mjs';
export class NamespaceReference extends Reference {
    /**
     * @param { String } namespace
    */
    constructor(namespace) {
        if (!namespace) {
            throw new Error('namespace argument is null or undefined')
        }
        if (typeof namespace !== 'string') {
            throw new Error(`namespace argument is not a ${String.name}`)
        }
        const { Id } = Reference.find({ namespace }) || {};
        if (Id) {
            super(Id);
        } else {
            super();
        }
        super.metadata.namespace = namespace;
    }
    toString() {
        return super.metadata.namespace;
    }
}