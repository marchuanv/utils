import { Interface, JSTypeMap, SecureContext } from '../registry.mjs';
class Cat { meow() { } get colour() { } get name() { } };
class InvalidCatInterface extends Interface { };
class CatInterfaceInvalidMembers extends Interface { meow() { } get colour() { } get name() { } };
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
JSTypeMap.register(Cat, CatInterface, new Cat(), false);
JSTypeMap.register(StringInterface, String, '', false);
JSTypeMap.register(BooleanInterface, Boolean, false, false);
fdescribe(`when creating the ${Cat.name} interface`, () => {
    it(`should raise an error if the ${Cat.name} class does not match an interface.`, () => {
        try {
            new InvalidCatInterface(Cat, false, new SecureContext());
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`${InvalidCatInterface.name} interface does not have the meow member or the member is incorrect.`);
        }
    });
    it(`should raise an error if the inteface members are not configured correctly.`, () => {
        try {
            new CatInterfaceInvalidMembers(Cat, false, new SecureContext());
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`${CatInterfaceInvalidMembers.name}.meow member did not return an instance of an ${Interface.name}.`);
        }
    });
    fit(`should NOT raise an error if the ${Cat.name} class match the interface.`, () => {
        try {
            const catInterface = new CatInterface(Cat, false, new SecureContext());
            console.log();
        } catch (error) {
            console.log(error);
            fail('did not expect any errors.');
        }
    });
});