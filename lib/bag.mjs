import { EventEmitter, Relation, randomUUID } from './registry.mjs';
const privateBag = new WeakMap();

class BagMap {
    /**
     * @param { Object } owner
     * @param { String } name
     * @param { EventEmitter } event
    */
    constructor(owner, name, event) {
        this._Id = randomUUID();
        this._owner = owner;
        this._name = name;
        this._event = event;
        this._items = new Array();
    }
    /**
     * @returns { String }
    */
    get Id() {
        return this._Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        return this._name;
    }
    /**
     * @returns { Object }
    */
    get owner() {
        return this._owner;
    }
    /**
     * @returns { EventEmitter }
    */
    get event() {
        return this._event;
    }
    /**
     * @returns { Array<BagItem> }
    */
    get items() {
        return this._items;
    }
}

class BagItem {
    /**
     * @param { String } name
     * @param { Object } value
    */
    constructor(name, value) {
        this._name = name;
        this._value = value;
    }
    /**
     * @returns { String }
    */
    get name() {
        return this._name;
    }
    /**
     * @returns { Object }
    */
    get value() {
        return this._value;
    }
}

export class Bag extends Relation {
    /**
     * @param { class } owner
    */
    constructor(owner) {
        super();
        if (!owner) {
            throw new Error('owner argument not provided.');
        }
        const thisName = owner.constructor.name;
        if (!thisName) {
            throw new Error('could not determine bag name.');
        }
        privateBag.set(this, new BagMap(
            owner,
            thisName,
            new EventEmitter()
        ));
        Object.seal(this);
    }
    get Id() {
        const { Id } = getBagMap(this);
        return Id;
    }
    /**
     * @param { String } name
     * @param { Boolean } onceOff
     * @param { Function } callback
    */
    on(name, onceOff, callback) {
        const { event } = getBagMap(this);
        if (onceOff) {
            event.once(name, async (value) => {
                const newValue = await callback(value);
                if (newValue !== undefined) {
                    this.set(name, newValue);
                }
            });
        } else {
            event.on(name, async (value) => {
                const newValue = await callback(value);
                if (newValue !== undefined) {
                    this.set(name, newValue);
                }
            });
        }
    }
    /**
     * @param { Object } _owner
     * @returns { Boolean }
    */
    isOwner(_owner) {
        if (!_owner) {
            throw new Error('_owner argument not provided.');
        }
        const { owner } = getBagMap(this);
        if (owner === _owner) {
            return true;
        }
        return false;
    }
    /**
     * @param { String } name
     * @param { Object } value
    */
    set(name, value) {
        const { items, event } = getBagMap(this);
        if (!items.find(i => i.name === name)) {
            const bagItem = new BagItem(name, value);
            items.push(bagItem);
        }
        event.emit(name, value);
    }
    /**
     * @param { String } name
     * @returns { T }
    */
    get(name) {
        const { items } = getBagMap(this);
        const bagItem = items.find(i => i.name === name);
        if (bagItem) {
            return bagItem.value;
        } else {
            return null;
        }
    }
    /**
     * @returns { Array<String> }
    */
    keys() {
        const { items } = getBagMap(this);
        return items.map(i => i.name);
    }
}
/**
 * @returns { BagMap }
*/
function getBagMap(context) {
    const obj = privateBag.get(context);
    if (obj instanceof BagMap) {
        return obj;
    }
}