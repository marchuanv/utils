import { addSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import { General } from './lib/general.mjs';
import { Import } from './lib/import.mjs';
import { Member } from './lib/reflect/member.mjs';
import { Schema } from './lib/schema.mjs';
import { Security } from './lib/security.mjs';
import { Specs } from './lib/specs.mjs';

const general = new General();
const importExtended = new Import();
const security = new Security();
const { walkDir } = general;

export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes, randomUUID } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
export { basename, join, resolve } from 'node:path';
export { Container } from './lib/container.mjs';
export { ContainerReference } from './lib/container.reference.mjs';
export { ClassMember } from './lib/reflect/class.member.mjs';
export { ClassMemberSchema } from './lib/reflect/class.member.schema.mjs';
export { MemberParameter } from './lib/reflect/member.parameter.mjs';
export { MethodMember } from './lib/reflect/method.member.mjs';
export { PropertyMember } from './lib/reflect/property.member.mjs';

const baseUrl = import.meta.url;
const currentDir = fileURLToPath(new URL('./', baseUrl));

export { Jasmine, Member, Schema, Specs, addSchema, currentDir, fileURLToPath, general, importExtended, pathToFileURL, security, validate as validateSchema, walkDir };

