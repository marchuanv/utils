import { Buffer, constants, createHmac, generateKeyPairSync, privateDecrypt, publicEncrypt, randomBytes } from "./registry.mjs";
export class Security {
    genRandomString(length) {
        return randomBytes(Math.ceil(length / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, length); /** return required number of characters */
    }
    sha512(password, salt) {
        const hash = createHmac('sha512', salt); /** Hashing algorithm sha512 */
        hash.update(password);
        const value = hash.digest('hex');
        return {
            hashedPassphraseSalt: salt,
            hashedPassphrase: value
        };
    };
    hashPassphrase(userpassword, salt) {
        salt = salt || this.genRandomString(16); /** Gives us salt of length 16 */
        return this.sha512(userpassword, salt);
    }
    decryptFromBase64Str(base64Str, decryptionKey, passphrase) {
        const dataBuf = Buffer.from(base64Str, "base64");
        try {
            return privateDecrypt({
                key: decryptionKey,
                passphrase,
                padding: constants.RSA_PKCS1_PADDING
            }, dataBuf).toString("utf8");
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    encryptToBase64Str(dataStr, encryptionkey) {
        const dataBuf = Buffer.from(dataStr, "utf8");
        try {
            return publicEncrypt({
                key: encryptionkey,
                padding: constants.RSA_PKCS1_PADDING
            }, dataBuf).toString("base64");
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    generatePublicPrivateKeys(passphrase) {
        return generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase
            }
        });
    }
}