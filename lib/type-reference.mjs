import { Reference } from '../registry.mjs';
export class TypeReference extends Reference {
    /**
     * @param { { namespace: String } } metadata
    */
    constructor(metadata) {
        if (!metadata) {
            throw new Error('metadata argument is null or undefined')
        }
        if (!metadata.namespace) {
            throw new Error('namespace not found in metadata.');
        }
        const { namespace } = metadata;
        const { parentReferenceId } = Array.from(Reference.nextRef())
            .map(ref => ref.metadata)
            .map(meta => meta.namespace)
            .filter(ns => ns === namespace);
        if (parentReferenceId) {
            super(parentReferenceId);
        } else {
            super();
        }
        for(const key of Object.keys(metadata)) {
            super.metadata[key] = metadata[key];
        }
    }
}