import { GUID } from '../registry.mjs';
const referenceMap = new WeakMap();
/**
 * Represents a reference with a unique identifier and associated references.
 */
export class Reference {
    /**
     * Creates an instance of Reference.
     * @param {GUID|null} parentReferenceId - The ID of the parent reference. Defaults to null.
     * @throws {Error} Throws an error if parentReferenceId is not a GUID or null.
     */
    constructor(parentReferenceId = null) {
        const associatedReferenceIds = [];
        if (parentReferenceId !== null && !(parentReferenceId instanceof GUID)) {
            throw new Error('The parent reference ID must be a GUID or null.');
        }
        const Id = new GUID();
        // Create the reference
        const referenceData = { Id, associatedReferenceIds, metadata: {} };
        // Store the reference in the central map
        referenceMap.set(Id, referenceData);
        referenceMap.set(this, referenceData);
        // Associate with the parent reference bidirectionally if parentReferenceId is not null
        if (parentReferenceId === null) {
            // If parentReferenceId is null, create the root reference
            if (!referenceMap.has(Reference)) {
                referenceMap.set(Reference, referenceData);
            }
            ({ Id: parentReferenceId } = referenceMap.get(Reference));
        } else {
            if (!referenceMap.has(parentReferenceId)) {
                throw new Error('Parent reference not found in the reference map.');
            }
        }
        const parentReferenceData = referenceMap.get(parentReferenceId);
        parentReferenceData.associatedReferenceIds.push(Id);
        referenceData.associatedReferenceIds.push(parentReferenceData.Id);
    }
    /**
     * Gets the unique identifier of the reference.
     * @returns { GUID }
    */
    get Id() {
        const { Id } = referenceMap.get(this);
        return Id;
    }
    /**
     * Gets metadata that further describes the reference.
     * @returns { Object }
    */
    get metadata() {
        const { metadata } = referenceMap.get(this);
        return metadata;
    }
    /**
     * Checks if the reference is associated with a given ID.
     * @param {GUID} id - The ID to check association with.
     * @returns {boolean} True if the reference is associated with the given ID, otherwise false.
     */
    isAssociatedWith(id) {
        const referenceData = referenceMap.get(this);
        return referenceData.associatedReferenceIds.some(guid => guid === id);
    }
    /**
     * Returns an iterator, for iterating over all reference Id's, except the root reference Id.
     * @return { Iterable<(Reference)> }
    */
    static *nextRef() {
        const visitedIds = new Set();
        const { Id } = referenceMap.get(Reference) || {};
        if (!visitedIds.has(Id)) {
            visitedIds.add(Id);
            const ref = referenceMap.get(Id);
            if (ref) {
                yield ref;
            }
        }
        if (Id) {
            const rootReferenceId = Id;
            const queue = [rootReferenceId]; // Start with root reference ID in the queue
            while (queue.length > 0) {
                const currentId = queue.shift();
                const currentReferenceData = referenceMap.get(currentId);
                if (currentReferenceData) {
                    for (const childId of currentReferenceData.associatedReferenceIds) {
                        if (!visitedIds.has(childId)) {
                            queue.push(childId);
                            visitedIds.add(childId);
                            if (childId !== rootReferenceId) {
                                const ref = referenceMap.get(childId);
                                if (ref) {
                                    yield ref;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Finds a reference based on metadata using the nextRef iterator.
     * @param {Object} metadata - The metadata to search for.
     * @returns {Reference|null} A reference that matches the provided metadata, or null if no match is found.
     */
    static find(metadata) {
        // If metadata is empty, return null
        if (Object.keys(metadata).length === 0) {
            return null;
        }
        for (const referenceData of Reference.nextRef()) {
            if (metadataMatches.call(this, referenceData.metadata, metadata)) {
                return referenceData;
            }
        }
        return null;
    }
}
/**
 * Checks if the provided metadata matches a reference's metadata.
 * @param {Object} referenceMetadata - Metadata of the reference.
 * @param {Object} queryMetadata - Metadata to search for.
 * @returns {boolean} True if the reference metadata matches the query metadata, otherwise false.
 */
function metadataMatches(referenceMetadata, queryMetadata) {
    for (const key in queryMetadata) {
        if (queryMetadata.hasOwnProperty(key)) {
            if (!referenceMetadata.hasOwnProperty(key) || referenceMetadata[key] !== queryMetadata[key]) {
                return false;
            }
        }
    }
    return true;
}