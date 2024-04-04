import { registerSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { sha1 } from 'js-sha1';
import { General } from './lib/general.mjs';

import { fileURLToPath, pathToFileURL } from 'url';
import vm from "vm";
import { Bag } from './lib/bag.mjs';
import { Import } from './lib/import.mjs';
import { NULL, Reflection, UNDEFINED } from './lib/reflection.mjs';
import { Schema } from './lib/schema.mjs';
import { SecureContext } from './lib/secure-context.mjs';
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
export { Serialiser } from './lib/serialiser.mjs';
export { TypeInfo } from './lib/type-info.mjs';
export { TypeMemberInfo } from './lib/type-member-info.mjs';
export { ANY, Type, UNKNOWN } from './lib/type.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    Bag, General, Jasmine, NULL, Reflection, Schema, SecureContext, UNDEFINED, UUID, VERBOSE, fileURLToPath, importExtended,
    pathToFileURL, registerSchema, security, sha1, validate as validateSchema,
    vm
};

