const textEncoding = require('text-encoding');
module.exports = {
    /**
     * Converts an array of bytes to text
     * @param {array} An array of utf-8 bytes
     * @returns {string} A string
     */
    arrayToStr: function (array) {
        var v = new textEncoding.TextDecoder('utf-8');
        return v.decode(array);
    },

    /**
     * Converts a string to a utf-8 array
     * @param {str} A string
     * @returns {Array} Returns an array of numbers
     */
    strToArray: function (str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            result.push(code);
        }
        return result;
    },

    /**
     * Decodes a string or array of DGData
     * Arrays work best, as strings loose data due to utf-8 / unicode
     * @param {data} This is the data to be decoded
     * @returns {string} This is the result of the data
     */
    decode: function (data) {
        if (typeof data == 'string') data = module.exports.strToArray(data);

        for (var i = 14; i < data.length; i++) {
            data[i] = data[i] - 21;
            data[i] = data[i] - ((i - 14) % 6);
        }
        return module.exports.arrayToStr(data).substring(14);
    },

    /**
     * Encodes a string of data
     * @param {data} Data to be encoded
     * @returns {array} An array of bytes
     */
    encode: function (data) {
        var loc3 = 0;
        if (typeof data !== 'string') {
            data = module.exports.arrayToStr(data);
        }

        var loc2 = module.exports.strToArray('DGDATA' + module.exports.hash(data));

        for (var i = 0; i < data.length; i++) {
            loc3 = data.charCodeAt(i) + 21 + (i % 6);
            loc2.push(loc3 % 256);
        }

        return loc2;
    },

    /**
     * Encodes a number - You really shouldn't have to deal with this
     * @param {number} The number to be encoded
     * @returns {number} The result
     */
    secondHash: function (number) {
        var loc2 = new Uint32Array(1);
        loc2[0] = number;
        for (var i = 0; i < 8; i++) {
            if (loc2 & 1) {
                loc2[0] = loc2[0] >> 1;
                loc2[0] = loc2[0] ^ 3988292384;
            } else {
                loc2[0] = loc2[0] >> 1;
            }
        }
        return loc2;
    },

    /**
     * Hashes some data - You really shouldn't have to deal with this
     * unless you want to manually verify the program
     * @param {data} Some data - it's a string
     * @returns {array} An array of bytes
     */
    hash: function (data) {
        var loc2 = 0;
        var loc3 = 0;
        var loc7 = new Uint32Array(1);

        for (var i = 0; i < data.length; i++) {
            loc2 = data.charCodeAt(i);
            loc3 = (loc7[0] ^ loc2) & 255;
            loc7[0] = ((loc7[0] >> 8) & 16777215) ^ module.exports.secondHash(loc3);
        }
        if (loc7[0] < 0) {
            loc7[0] = 4294967295 + loc7[0] + 1;
        }
        var loc4 = loc7[0].toString(16);
        while (loc4.length < 8) {
            loc4 = '0' + loc4;
        }
        return loc4;
    }
};
