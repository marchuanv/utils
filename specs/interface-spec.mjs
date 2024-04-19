import { Interface, JSTypeMap, BagState } from '../registry.mjs';
class Cat { meow() { } get colour() { } get name() { } };
class InvalidCatInterfaceMembers extends Interface { meow() { } get colour() { } get name() { } };
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
describe(`when creating the ${Cat.name} interface`, () => {
    it(`should raise an error if the inteface members are not configured correctly.`, () => {
        try {
            JSTypeMap.register(InvalidCatInterfaceMembers, Cat, null, false);
            const invalidCatInterfaceMembers = new InvalidCatInterfaceMembers();
            if (invalidCatInterfaceMembers.dispose(BagState.REHYDRATE)) {
                invalidCatInterfaceMembers = new CatInterface();
            }
            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`${InvalidCatInterfaceMembers.name}.meow member did not return an instance of an ${Interface.name}.`);
        }
    });
    it(`should raise an error if the inteface was not registered`, () => {
        try {
            
            JSTypeMap.register(StringInterface, String, '', false);
            JSTypeMap.register(BooleanInterface, Boolean, false, false);
            JSTypeMap.register(CatInterface, Cat, null, false);
            JSTypeMap.unregister(CatInterface);

            let catInterface = new CatInterface();
            if (catInterface.dispose(BagState.REHYDRATE)) {
                catInterface = new CatInterface();
            }

            fail('expected an error');
        } catch (error) {
            console.log(error);
            expect(error.message).toBe(`no mapping found for CatInterface.`);
        }
    });
    it(`should NOT raise an error if the ${Cat.name} class match.`, () => {
        try {

            JSTypeMap.register(StringInterface, String, '', false);
            JSTypeMap.register(BooleanInterface, Boolean, false, false);
            JSTypeMap.register(CatInterface, Cat, null, false);
            
            let catInterface = new CatInterface();
            if (catInterface.dispose(BagState.REHYDRATE)) {
                catInterface = new CatInterface();
            }
            
            const colourMember = catInterface.members.find(x => x.name === 'colour');
            const nameMember = catInterface.members.find(x => x.name === 'name');
            const meowMember = catInterface.members.find(x => x.name === 'meow');

            expect(colourMember).toBeDefined();
            expect(nameMember).toBeDefined();
            expect(meowMember).toBeDefined();

            expect(colourMember.$interface).toBeInstanceOf(StringInterface);
            expect(nameMember.$interface).toBeInstanceOf(StringInterface);
            expect(meowMember.$interface).toBeInstanceOf(BooleanInterface);

        } catch (error) {
            console.log(error);
            fail('did not expect any errors.');
        }
    });
});