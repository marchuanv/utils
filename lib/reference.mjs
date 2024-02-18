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
        const referenceData = {
            Id,
            associatedReferenceIds
        };

        // Store the reference in the central map
        referenceMap.get(Reference).push(Id);
        referenceMap.set(Id, referenceData);
        referenceMap.set(this, referenceData);

        if (parentReferenceId !== null) {
            // Associate with the parent reference bidirectionally
            const parentReferenceData = referenceMap.get(parentReferenceId);
            if (parentReferenceData) {
                parentReferenceData.associatedReferenceIds.push(Id);
                associatedReferenceIds.push(parentReferenceId);
            } else {
                throw new Error('Parent reference not found in the reference map.');
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
     * Returns an iterator for iterating over all references.
     * @returns {Iterator} An iterator for iterating over all references.
    */
    static *nextReference() {
        for (const referenceId of referenceMap.get(Reference)) {
            yield referenceId;
        }
    }
}

// Initialize the weak map with an empty array for storing reference IDs
referenceMap.set(Reference, []);