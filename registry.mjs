import { addSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import vm from "vm";

import { Container } from './lib/container.mjs';
import { walkDir } from './lib/general.mjs';
import { GUID } from './lib/guid.mjs';
import { Import } from './lib/import.mjs';
import { Member } from './lib/member.mjs';
import { Security } from './lib/security.mjs';
import { Specs } from './lib/specs.mjs';
import { TypeDefinition } from "./lib/type.definition.mjs";

const importExtended = new Import();
const security = new Security();

export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
export { basename, join, resolve } from 'node:path';
export { ClassIntegrity } from './lib/class.integrity.mjs';
export { ClassInterface } from './lib/class.interface.mjs';
export { MemberParameter } from './lib/member.parameter.mjs';
export { MethodMember } from './lib/method.member.mjs';
export { PrimitiveType } from './lib/primitivetype.mjs';
export { PropertyMember } from './lib/property.member.mjs';
export { ReferenceType } from './lib/referencetype.mjs';
export { Schema } from './lib/schema.mjs';

setMetaSchemaOutputFormat(VERBOSE);

export {
    Container, GUID,
    Jasmine,
    Member,
    Specs,
    TypeDefinition,
    VERBOSE,
    addSchema, fileURLToPath,
    importExtended,
    pathToFileURL, security,
    validate as validateSchema,
    vm,
    walkDir
};

