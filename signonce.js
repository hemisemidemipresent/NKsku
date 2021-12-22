const { hex_md5 } = require('./md5');
const skuSignature = 'A26308E242742374';
const length = 1024 * 1024;

module.exports = {
    /**
     * glorified Math.random()
     * @returns {int} a 64 bit nonce
     */
    generate64BitNonce() {
        return Math.random() * Math.pow(2, 64); // really any RNG will do
    },
    /**
     * creates a sig
     * @param {*} json json
     * @param {int} nonce
     * @param {string} sessionID (optional)
     */
    sign(json, nonce, sessionID = null) {
        // this is to check whether the user has just dumped an entire object in without thinking
        if (typeof json == 'object')
            if (json.data && json.auth && json.sig && json.nonce) {
                json = json.data;
                if (!nonce) nonce = json.nonce;
            }
        // just in case yk
        if (typeof json != 'string') json = JSON.stringify(json);

        if (json.length > length) {
            let md5 = hex_md5(sessionID + skuSignature + json.substr(0, length));
            return `W/${length}/${md5}${nonce}`;
        } else if (sessionID != null) {
            return hex_md5(sessionID + skuSignature + json + nonce);
        } else {
            return hex_md5(skuSignature + json + nonce);
        }
    }
};
