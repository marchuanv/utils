
import { currentDir, Jasmine, resolve } from '../registry.mjs';
export class Specs {
    /**
     * @param { Number } timeOutMill
     * @param { String } specsDirPath
     */
    constructor(timeOutMill, specsDirPath) {
        const jasmine = new Jasmine({ projectBaseDir: currentDir });
        const _specsDirPath = resolve(specsDirPath);
        jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = timeOutMill;
        jasmine.addMatchingSpecFiles([`${_specsDirPath}/**/*.spec.mjs`]);
    }
    run() {
        jasmine.execute();
    }
}
