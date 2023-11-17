export class Relation extends Map {
    constructor() {
        super();
        super.set('_parent', null);
        super.set('_children', []);
        super.set('_index', -1);
        super.set('_currentChild', null);
    }
    get parent() {
        return super.get('_parent');
    }
    set child(value) {
        value.set('_parent', this);
        super.get('_children').push(value);
    }
    get next() {
        let index = super.get('_index');
        index = index + 1;
        super.set('_index', index);
        const currentChild = super.get('_children')[index];
        super.set('_currentChild', currentChild);
        if (currentChild) {
            return true;
        }
        return false;
    }
    get firstChild() {
        this.reset();
        if (this.next) {
            const child = this.current;
            this.reset();
            return child;
        }
        return null;
    }
    reset() {
        super.set('_index', -1);
        super.set('_currentChild', null);
    }
    get current() {
        return super.get('_currentChild');
    }
}