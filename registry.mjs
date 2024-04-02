import { registerSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import { Bag, BagKey, SecureContext } from './lib/bag.mjs';
export { sha1 } from 'js-sha1';
export { Schema } from './lib/schema.mjs';

import vm from "vm";
import { base64ToString, stringToBase64, walkDir } from './lib/general.mjs';
import { Import } from './lib/import.mjs';
import { NULL, Reflection, UNDEFINED } from './lib/reflection.mjs';
import { Security } from './lib/security.mjs';

const importExtended = new Import();
const security = new Security();

export { Specs } from 'component.specs';
export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHash, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes, randomUUID } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
export { basename, dirname, extname, join, relative, resolve } from 'node:path';
export { General } from './lib/general.mjs';
export { GUID, GUIDSchema } from './lib/guid.mjs';
export { Serialiser } from './lib/serialiser.mjs';
export { TypeInfo, UNKNOWN } from './lib/type-info.mjs';
export { TypeMemberInfo } from './lib/type-member-info.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    Bag, BagKey, Jasmine, NULL, Reflection, SecureContext, UNDEFINED, VERBOSE, base64ToString, fileURLToPath, importExtended,
    pathToFileURL, registerSchema, security, stringToBase64, validate as validateSchema,
    vm,
    walkDir
};

