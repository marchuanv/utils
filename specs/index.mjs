
import { Jasmine, fileURLToPath } from '../lib/registry.mjs';
process.specs = new WeakMap();
const baseUrl = import.meta.url;
const __dirname = fileURLToPath(new URL('./', baseUrl));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();
process.on('exit', () => {
    const topLevelSuite = jasmine.env.topSuite();
    for (const child of topLevelSuite.children) {
        if (child.suite_.status() === 'passed') {
            console.log(`-> ${child.description} test suite passed`);
        } else {
            console.log(`-> ${child.description} test suite failed`);
        }
    }
});
