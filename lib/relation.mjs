const privateBag = new WeakMap();

class RelationMap {
    constructor() {
        this._parent = null;
        this._children = [];
        this._index = -1;
        this._current = null;
    }
    /**
     * @returns { Relation }
    */
    get parent() {
        return this._parent;
    }
    /**
     * @param { Relation } value
    */
    set parent(value) {
        this._parent = value;
    }
    /**
     * @returns { Array<Relation> }
    */
    get children() {
        return this._children;
    }
    /**
     * @param { Array<Relation> } value
    */
    set children(value) {
        this._children = value;
    }
    /**
     * @returns { Number }
    */
    get index() {
        return this._index;
    }
    /**
     * @param { Number } value
    */
    set index(value) {
        this._index = value;
    }
    /**
     * @returns { Relation }
    */
    get current() {
        return this._current;
    }
    /**
     * @param { Relation } value
    */
    set current(value) {
        this._current = value;
    }
}

export class Relation {
    constructor() {
        privateBag.set(this, new RelationMap());
        Object.seal(this);
    }
    /**
     * @returns { Relation }
    */
    get parent() {
        const { parent } = getRelationMap(this);
        return parent;
    }
    /**
     * @returns { Relation }
    */
    set parent(value) {
        const thisMap = getRelationMap(this);
        thisMap.parent = value;
    }
    /**
     * @param { Relation } value
    */
    set child(value) {
        const _child = getRelationMap(value);
        _child.parent = this;
        const thisMap = getRelationMap(this)
        thisMap.children.push(value);
    }
    get next() {
        const thisMap = getRelationMap(this);
        thisMap.index = thisMap.index + 1;
        thisMap.current = thisMap.children[thisMap.index];
        if (thisMap.current) {
            return true;
        }
        return false;
    }
    reset() {
        const thisMap = getRelationMap(this);
        thisMap.index = -1;
        thisMap.current = null;
    }
    get current() {
        const { current } = getRelationMap(this);
        return current;
    }
    get first() {
        this.reset();
        if (this.next) {
            const child = this.current;
            this.reset();
            return child;
        }
        return null;
    }
}

/**
 * @returns { RelationMap }
*/
function getRelationMap(context) {
    const obj = privateBag.get(context);
    if (obj instanceof RelationMap) {
        return obj;
    }
}