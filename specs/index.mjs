import { Animal, Dog, Food, Specs, TypeDefinition } from "../registry.mjs";
TypeDefinition.register([
    { scriptFilePath: './specs/classes/animal.mjs', targetClass: Animal },
    { scriptFilePath: './specs/classes/food.mjs', targetClass: Food },
    { scriptFilePath: './specs/classes/dog.mjs', targetClass: Dog },
]).then(() => {
    const specs = new Specs(60000, './');
    specs.run();
}).catch((error) => {
    console.error(error);
});