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
export { BagAttribute } from './lib/export-a/bag-attribute.mjs';
export { BagState } from './lib/export-a/bag-state.mjs';
export { Bag } from './lib/export-a/bag.mjs';
export { SecureBagKeys } from './lib/export-a/secure-bag-keys.mjs';
export { SecureContext } from './lib/export-a/secure-context.mjs';
export { ClassMember } from './lib/export-b/class-member.mjs';
export { JSType, JSTypeAtt } from './lib/export-b/js-type.mjs';
export { JSTypeConstraint } from './lib/export-d/js-type-constraint.mjs';
export { JSTypeMap } from './lib/export-d/js-type-map.mjs';
export { JSTypeRegister } from './lib/export-d/js-type-register.mjs';
export { Interface } from './lib/export-e/interface.mjs';
export { Schema } from './lib/export-e/schema.mjs';
export { Serialiser } from './lib/serialiser.mjs';
export { UUIDMap } from './lib/uuid-map.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    General, Jasmine, NULL, Reflection, UNDEFINED, UUID, VERBOSE, fileURLToPath, importExtended,
    pathToFileURL, registerSchema, security, sha1, validate as validateSchema,
    vm
};

