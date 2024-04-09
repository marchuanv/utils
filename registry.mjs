import { registerSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { sha1 } from 'js-sha1';
import { General } from './lib/general.mjs';

import { fileURLToPath, pathToFileURL } from 'url';
import vm from "vm";
import { Import } from './lib/import.mjs';
import { NULL, Reflection, UNDEFINED } from './lib/reflection.mjs';
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
export { DataSchema } from './lib/export-a/data-schema.mjs';
export { Properties, Property } from './lib/export-a/properties.mjs';
export { Bag } from './lib/export-b/bag.mjs';
export { TypeInfo } from './lib/export-b/type-info.mjs';
export { ANY, Type, UNKNOWN } from './lib/export-b/type.mjs';
export { TypeInfoSchema } from './lib/export-c/type-info-schema.mjs';
export { TypeMemberInfo } from './lib/export-c/type-member-info.mjs';
export { Schema } from './lib/export-d/schema.mjs';
export { TypeMemberInfoSchema } from './lib/export-e/type-member-info-schema.mjs';
export { TypeSchema } from './lib/export-e/type-schema.mjs';
export { Serialiser } from './lib/serialiser.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    General, Jasmine, NULL, Reflection, SecureContext, UNDEFINED, UUID, VERBOSE, fileURLToPath, importExtended,
    pathToFileURL, registerSchema, security, sha1, validate as validateSchema,
    vm
};

