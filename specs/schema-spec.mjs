import { Interface, JSTypeMap, Schema } from '../registry.mjs';
class Cat extends Schema {
    meow() {
        return true;
    }
    get colour() {
        return 'grey'
    }
    get name() {
        return 'pepper';
    }
};
class StringInterface extends Interface { }
class BooleanInterface extends Interface { }
class CatInterface extends Interface {
    meow() {
        return new BooleanInterface();
    }
    get colour() {
        return new StringInterface();
    }
    get name() {
        return new StringInterface();
    }
};
fdescribe(`when creating a ${Cat.name} given a schema`, () => {
    it(`should `, () => {
        try {
            JSTypeMap.register(StringInterface, String, '', false);
            JSTypeMap.register(BooleanInterface, Boolean, false, false);
            JSTypeMap.register(CatInterface, Cat, null, false);
            JSTypeMap.register(Cat, CatInterface, null, false);
            const cat = new Cat();
            cat.validate();
        } catch (error) {
            console.log(error);
            fail('did not expect any errors.');
        }
    });
});