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
        const referenceData = { Id, associatedReferenceIds };
        // Store the reference in the central map
        referenceMap.set(Id, referenceData);
        referenceMap.set(this, referenceData);
        // Associate with the parent reference bidirectionally if parentReferenceId is not null
        if (parentReferenceId !== null) {
            if (!referenceMap.has(parentReferenceId)) {
                throw new Error('Parent reference not found in the reference map.');
            }
            const parentReferenceData = referenceMap.get(parentReferenceId);
            parentReferenceData.associatedReferenceIds.push(Id);
            referenceData.associatedReferenceIds.push(parentReferenceData.Id);
        } else {
            // If parentReferenceId is null, create the root reference
            if (!referenceMap.has(Reference)) {
                referenceMap.set(Reference, referenceData);
            }
        }
    }
    /**
     * Gets the unique identifier of the reference.
     * @returns {GUID} The unique identifier of the reference.
     */
    get Id() {
        const referenceData = referenceMap.get(this);
        return referenceData.Id;
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
     * @return { Iterable<(GUID)> }
    */
    static nextReference() {
        const visitedIds = new Set();
        const { Id } =  referenceMap.get(Reference) || { };
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
                                yield childId;
                            }
                        }
                    }
                }
            }
        }
    }
}