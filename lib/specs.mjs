
import { Jasmine, resolve } from '../registry.mjs';
export class Specs {
    /**
     * @param { Number } timeOutMill
     * @param { String } specsDirPath
     */
    constructor(timeOutMill, specsDirPath) {
        const projectBaseDir =  resolve(specsDirPath);
        this._jasmine = new Jasmine({ projectBaseDir });
        this._jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = timeOutMill;
        this._jasmine.addMatchingSpecFiles([`${projectBaseDir}/**/*.spec.mjs`]);
    }
    run() {
        this._jasmine.execute();
    }
}
