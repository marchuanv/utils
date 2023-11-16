const privateBag = new WeakMap();
export class Bag extends Map {
    /**
     * @param { Object } owner
    */
    constructor(owner) {
        super();
        if (!owner) {
            throw new Error('owner argument(Object) not provided.');
        }
        if (!privateBag.has(owner)) {
            privateBag.set(this, owner);
        }
    }
    /**
     * @param { Object } owner
     * @returns { Boolean }
    */
    isOwner(owner) {
        if (!owner) {
            throw new Error('owner argument(Object) not provided.');
        }
        const thisOwner = privateBag.get(this);
        if (!thisOwner) {
            throw new Error(`owner of ${Bag.name} is undefined or null`);
        }
        if (thisOwner === owner) {
            return true;
        }
        return false;
    }
}