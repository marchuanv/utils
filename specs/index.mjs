import { Specs, TypeDefinition } from "../registry.mjs";
import { Animal } from "./classes/animal.mjs";
import { Dog } from "./classes/dog.mjs";
import { Food } from "./classes/food.mjs";
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
export { Animal, Dog, Food };

