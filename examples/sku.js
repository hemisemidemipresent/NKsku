// unpacking a sku file
// a sku file is dgdata, then u get a json whose ".Data" is base64 + dgdata'ed

const fs = require('fs');
const nksku = require('nksku');

const file = fs.readFileSync('skuSettings-e3312318878d6459821d0c9505070f88.json-PRODUCTION');

const decoded = nksku.dgdata.decode(file);

const json = JSON.parse(decoded);

const data = json.Data;

const decodedBuffer = new Buffer.from(data, 'base64');

const actualData = nksku.dgdata.decode(decodedBuffer);

fs.writeFileSync('decrypted.txt', actualData);

// packing a sku file

const file2 = fs.readFileSync('decrypted.txt');
console.log(file2);
const encodedBytes = nksku.dgdata.encode(file2);
console.log(encodedBytes);
const buffer = new Buffer.from(encodedBytes);

const Data = buffer.toString('base64');

const jsonString = `{"Data":"${Data}","Etag":"\\"e3be19eb1d0a94da90928e6870ec16d2\\""}`; // e3be19eb1d0a94da90928e6870ec16d2 is from the file lol
console.log(jsonString == decoded);

const encoded = nksku.dgdata.encode(jsonString);
