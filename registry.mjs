import { registerSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import { UUID } from './lib/uuid.mjs';
import { Bag, SecureContext } from './lib/bag.mjs';
import { Schema } from './lib/schema.mjs';
import { NULL, Reflection, UNDEFINED } from './lib/reflection.mjs';
import { TypeInfo } from './lib/type-info.mjs';
import vm from "vm";
import { base64ToString, stringToBase64, walkDir } from './lib/general.mjs';
import { Import } from './lib/import.mjs';
import { Security } from './lib/security.mjs';

const importExtended = new Import();
const security = new Security();

export { sha1 } from 'js-sha1';
export { Specs } from 'component.specs';
export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHash, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes, randomUUID } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
export { basename, dirname, extname, join, relative, resolve } from 'node:path';
export { General } from './lib/general.mjs';
export { SchemaBag } from './lib/schema-bag.mjs';
export { GUIDSchema } from './lib/guid-schema.mjs';
export { Serialiser } from './lib/serialiser.mjs';
export { TypeMemberInfo } from './lib/type-member-info.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    Bag, Jasmine, NULL, Reflection, SecureContext, UNDEFINED, VERBOSE, base64ToString, fileURLToPath, importExtended,
    pathToFileURL, registerSchema, security, stringToBase64, validate as validateSchema,
    vm,
    walkDir, Schema, TypeInfo, UUID
};

