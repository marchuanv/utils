import { registerSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import vm from "vm";
import { walkDir } from './lib/general.mjs';
import { GUID } from './lib/guid.mjs';
import { Import } from './lib/import.mjs';
import { Reflection } from './lib/reflection.mjs';
import { Security } from './lib/security.mjs';
import { Specs } from './lib/specs.mjs';

const importExtended = new Import();
const security = new Security();

export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
export { basename, dirname, extname, join, relative, resolve } from 'node:path';

setMetaSchemaOutputFormat(VERBOSE);

export {
    GUID,
    Jasmine, Reflection, Specs,
    VERBOSE, fileURLToPath,
    importExtended,
    pathToFileURL, registerSchema, security,
    validate as validateSchema,
    vm,
    walkDir
};

