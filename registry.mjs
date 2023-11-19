import Jasmine from 'jasmine';
import { General } from './lib/general.mjs';
import { Import } from './lib/import.mjs';
import { Properties } from './properties.mjs';
import { Relation } from './lib/relation.mjs';
import { Security } from './lib/security.mjs';
import { Specs } from './lib/spec.mjs';

const general = new General();
const importExtended = new Import();
const security = new Security();
const { walkDir } = general;

export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes, randomUUID } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
export { basename, join, resolve } from 'node:path';
export { fileURLToPath, pathToFileURL } from 'url';
export { Specs };

const baseUrl = import.meta.url;
const currentDir = fileURLToPath(new URL('./', baseUrl));

export { Jasmine, Properties, Relation, general, importExtended, security, walkDir, currentDir };