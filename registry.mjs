import { addSchema, setMetaSchemaOutputFormat, validate } from "@hyperjump/json-schema/draft-2020-12";
import { VERBOSE } from "@hyperjump/json-schema/experimental";
import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import vm from "vm";

import { Container } from './lib/container.mjs';
import { General } from './lib/general.mjs';
import { GUID } from './lib/guid.mjs';
import { Import } from './lib/import.mjs';
import { Member } from './lib/member.mjs';
import { Schema } from './lib/schema.mjs';
import { Security } from './lib/security.mjs';
import { Specs } from './lib/specs.mjs';
import { TypeDefinition } from "./lib/type.definition.mjs";

import { Animal } from "./specs/classes/animal.mjs";
import { Dog } from "./specs/classes/dog.mjs";
import { Food } from "./specs/classes/food.mjs";

TypeDefinition.register([
    { scriptFilePath: './specs/classes/animal.mjs', targetClass: Animal },
    { scriptFilePath: './specs/classes/food.mjs', targetClass: Food },
    { scriptFilePath: './specs/classes/dog.mjs', targetClass: Dog },
]).catch((error) => {
    console.error(error);
});

const general = new General();
const importExtended = new Import();
const security = new Security();
const { walkDir } = General;

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

setMetaSchemaOutputFormat(VERBOSE);

export {
    Animal, Container, Dog, Food, GUID,
    Jasmine,
    Member, Schema,
    Specs,
    TypeDefinition,
    VERBOSE,
    addSchema, fileURLToPath,
    general, importExtended,
    pathToFileURL, security,
    validate as validateSchema,
    vm,
    walkDir
};

