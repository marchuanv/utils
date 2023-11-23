import Jasmine from 'jasmine';
import { fileURLToPath, pathToFileURL } from 'url';
import { General } from './lib/general.mjs';
import { Import } from './lib/import.mjs';
import { Reflection } from './lib/reflection.mjs';
import { Security } from './lib/security.mjs';
import { Specs } from './lib/specs.mjs';

const general = new General();
const importExtended = new Import();
const security = new Security();
const reflection = new Reflection();
const { walkDir } = general;

export { EventEmitter } from 'events';
export { Buffer } from 'node:buffer';
export { constants, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes, randomUUID } from 'node:crypto';
export { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
export { basename, join, resolve } from 'node:path';
export { Specs };

const baseUrl = import.meta.url;
const currentDir = fileURLToPath(new URL('./', baseUrl));

export { Jasmine, currentDir, fileURLToPath, general, importExtended, pathToFileURL, reflection, security, walkDir };

