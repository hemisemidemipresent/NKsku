const aesjs = require('aes-js');
const crypto = require('crypto');
const zlib = require('zlib');

const DUMMY_HEADER_LENGTH = 44;
const PASSWORD_INDEX_LENGTH = 8;
const SALT_LENGTH = 24;
const KEY_LENGTH = 16;
const IV_LENGTH = 16;
const DERIVE_ITERATIONS = 10;
const PASSWORD = '11';
const algorithm = 'aes-128-cbc';

const { promisify } = require('util');

let compress = promisify(zlib.deflate);
let decompress = promisify(zlib.inflate);

module.exports = {
    /**
     * @summary Decrypts a given Buffer of an NK save file
     * @param {Buffer} bytes
     * @returns {string} decrypted Profile.save
     */
    async unpack(bytes) {
        let salt = bytes.slice(
            DUMMY_HEADER_LENGTH + PASSWORD_INDEX_LENGTH,
            DUMMY_HEADER_LENGTH + PASSWORD_INDEX_LENGTH + SALT_LENGTH
        );
        let encryptedBytes = bytes.slice(
            DUMMY_HEADER_LENGTH + PASSWORD_INDEX_LENGTH + SALT_LENGTH,
            bytes.length
        );
        let derivedBytes = crypto.pbkdf2Sync(
            PASSWORD,
            salt,
            DERIVE_ITERATIONS,
            KEY_LENGTH + IV_LENGTH,
            'sha1'
        );

        let iv = derivedBytes.slice(0, 16);
        let key = derivedBytes.slice(16, 32);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = await decipher.update(encryptedBytes);
        let final = decipher.final();
        let decryptedBytes = Buffer.concat([decrypted, final]);

        let json = await decompress(decryptedBytes);
        return json.toString();
    },
    /**
     * @summary Encrypts a given string of a decrypted NK save file
     * @param {Buffer} json The decrypted NK save file, as a buffer
     * @returns {Buffer} buffer to write data to
     */
    async pack(json) {
        let dummyHeader = Buffer.alloc(DUMMY_HEADER_LENGTH, 0); // literally any 44 byte thing will do

        let passwordIndex = Buffer.concat([
            Buffer.from([2]),
            Buffer.alloc(PASSWORD_INDEX_LENGTH - 1, 0)
        ]); // 0200000000000000

        let salt = crypto.randomBytes(SALT_LENGTH);

        let derivedBytes = crypto.pbkdf2Sync(
            PASSWORD,
            salt,
            DERIVE_ITERATIONS,
            KEY_LENGTH + IV_LENGTH,
            'sha1'
        );

        let iv = derivedBytes.slice(0, 16);
        let key = derivedBytes.slice(16, 32);

        let json = await readFile('p.txt', { encoding: null });
        let compressed = await compress(json, { level: 3 });

        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(compressed);
        let final = cipher.final();
        let encryptedBytes = Buffer.concat([encrypted, final]);

        return Buffer.concat([dummyHeader, passwordIndex, salt, encryptedBytes]);
    }
};
