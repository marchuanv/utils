import { registerSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { sha1 } from 'js-sha1';
import { General } from './lib/general.mjs';

import { fileURLToPath, pathToFileURL } from 'url';
import vm from "vm";
import { Import } from './lib/import.mjs';
import { NULL, Reflection, UNDEFINED } from './lib/reflection.mjs';
import { Security } from './lib/security.mjs';
import { UUID } from './lib/uuid.mjs';

const importExtended = new Import();
const security = new Security();

export { Specs } from 'component.specs';
export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHash, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes, randomUUID } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
export { basename, dirname, extname, join, relative, resolve } from 'node:path';
export { Bag, State } from './lib/export-a/bag.mjs';
export { SecureContext } from './lib/export-a/secure-context.mjs';
export { BagState } from './lib/export-b/bag-state.mjs';
export { Property } from './lib/export-b/property.mjs';
export { JSType, JSTypeMapping } from './lib/export-b/type-mapper.mjs';
export { TypeInfo } from './lib/export-c/type-info.mjs';
export { Interface } from './lib/export-d/interface.mjs';
export { TypeMemberInfo } from './lib/export-d/type-member-info.mjs';
export { Schema } from './lib/export-e/schema.mjs';
export { Serialiser } from './lib/serialiser.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    General, Jasmine, NULL, Reflection, UNDEFINED, UUID, VERBOSE, fileURLToPath, importExtended,
    pathToFileURL, registerSchema, security, sha1, validate as validateSchema,
    vm
};

