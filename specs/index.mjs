import { Specs, TypeDefinition, fileURLToPath, join } from "../registry.mjs";
import { Animal } from "./classes/animal.mjs";
import { Dog } from "./classes/dog.mjs";
import { Food } from "./classes/food.mjs";
let currentDir = fileURLToPath(new URL('./', import.meta.url));
const scriptsDirPath = join(currentDir, 'classes');
TypeDefinition.register([
    { scriptsDirPath, scriptFileName: 'animal.mjs', targetClass: Animal },
    { scriptsDirPath, scriptFileName: 'food.mjs', targetClass: Food },
    { scriptsDirPath, scriptFileName: 'dog.mjs', targetClass: Dog },
]).then(() => {
    const specs = new Specs(60000, './');
    specs.run();
}).catch((error) => {
    console.error(error);
});
export { Animal, Dog, Food };

