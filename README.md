# NKsku

This repo contains 3 parts

1. DGDATA
2. NK's `Profile.save`
3. NK's `sig`s and `nonce`s

### Documentation - Table of Contents

- [NKsku](#nksku)
    - [Documentation - Table of Contents](#documentation---table-of-contents)
- [Credit where credit is due](#credit-where-credit-is-due)
- [DGDATA - Data Scheme](#dgdata---data-scheme)
  - [How to use](#how-to-use)
  - [Ripped off documentation for DGDATA](#ripped-off-documentation-for-dgdata)
    - [arrayToStr](#arraytostr)
    - [strToArray](#strtoarray)
    - [decode](#decode)
    - [encode](#encode)
    - [secondHash](#secondhash)
    - [hash](#hash)
- [Profile.save](#profilesave)
  - [Usage](#usage)
    - [unpacking](#unpacking)
    - [packing](#packing)
  - [Functions](#functions)
    - [unpack](#unpack)
    - [pack](#pack)
- [signatures and nonces](#signatures-and-nonces)
  - [Usage](#usage-1)
- [Extras](#extras)

# Credit where credit is due

DGDATA code was from [this npm package](https://www.npmjs.com/package/dgdata) before it became a rickroll

Profile.save decryption was heavily referenced from [averysumener's c++ Profile.save thingy](https://github.com/averysumner/monke/) and [BowDown097](https://github.com/BowDown097)'s provided c# code. This would not have been possible without them.

`sig` and `nonce` formulas would not be available would not have been possible without [Woob](https://github.com/Vadmeme/) and `Coral#0762`

# DGDATA - Data Scheme

## How to use

Primitively, you can just `fetch` the url

```js
const nksku = require('nksku');
const url = "https://";

request(url, { encoding: null }, (err, res, body) => {
    if (err) {
        // handle error code
    }
    let decodedBody = nksku.dgdata.decode(body).toString('utf-8');
    let json = JSON.parse(decodedBody);
}
```

## Ripped off documentation for DGDATA

( Formerly known as NKTools)

### arrayToStr

Converts an array of bytes to text

**Parameters**

-   `array`
-   `An` **[array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of utf-8 bytes

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** A string

### strToArray

Converts a string to a utf-8 array

**Parameters**

-   `str`
-   `A` **str** string

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** Returns an array of numbers

### decode

Decodes a string or array of DGData
Arrays work best, as strings loose data due to utf-8 / unicode

**Parameters**

-   `data`
-   `This` **data** is the data to be decoded

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** This is the result of the data

### encode

Encodes a string of data

**Parameters**

-   `data`
-   `Data` **data** to be encoded

Returns **[array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of bytes

### secondHash

Encodes a number - You really shouldn't have to deal with this

**Parameters**

-   `number`
-   `The` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** number to be encoded

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The result

### hash

Hashes some data - You really shouldn't have to deal with this
unless you want to manually verify the program

**Parameters**

-   `data`
-   `Some` **data** data - it's a string

Returns **[array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of bytes

# Profile.save

## Usage

### unpacking

just some standard stuff, did something a bit different using promisify in this example

```js
const nksave = require('nksave');
const fs = require('fs');

const { promisify } = require('util');
const readFile = promisify(fs.readFile);

async function main() {
    let bytes = await readFile('./path/to/Profile.save', null);
    let json = nksave.unpack(bytes);
    // log it, write to file, etc
}
main();
```

### packing

similar to above example

```js
const nksave = require('nksave');
const fs = require('fs');

const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.readFile);

async function main() {
    let bytes = await readFile('./path/to/editedfile.json', null);
    let encoded = nksave.pack(bytes);
    await writeFile('./path/to/Profile.save', encoded);
}
main();
```

## Functions

### unpack

Decrypts a given Buffer of an NK save file

**Parameters**

-   `bytes`
-   A **[Buffer](https://nodejs.org/api/buffer.html)** of the `Profile.save` file

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** string containing the decrypted text in `Profile.save`

### pack

Encrypts a given Buffer the same way as NK encrypts its `Profile.save`
**Parameters**

-   `json`
-   A **[Buffer](https://nodejs.org/api/buffer.html)** of any text

Returns **[Buffer](https://nodejs.org/api/buffer.html)** buffer to write data to a `.save` file

# signatures and nonces

## Usage

```js
const signonce = require('signonce');

// generate a nonce
var nonce = signonce.generate64BitNonce();

// signature finder

// example 1: let it generate from a string
var obj = '{}';
var sig = signonce.sign(obj, nonce);

// example 1.5: let it generate w/o a nonce, used for validating responses
var obj = '{}';
var sig = signonce.sign(obj);

// example 2: sign from an obj
var obj = {};
var sig = signonce.sign(obj, nonce);

// example 2.5: let it generate w/o a nonce, used for validating responses
var obj = {};
var sig = signonce.sign(obj);

// example 3: sign from a whole request (probably for checking)
var obj = {
    data: '{}',
    auth: {
        session: null,
        appID: 11,
        skuID: 35,
        device: 'vrej'
    },
    sig: 'dc1027f28bc1ba12f6ef770588cdd1f4',
    nonce: '6129188331007147111'
};
var sig = signonce.sign(obj); // undefined nonce = use object's nonce

// example 4: same as example 3 but for some reason u put in a nonce
var obj = {
    data: '{}',
    auth: {
        session: null,
        appID: 11,
        skuID: 35,
        device: 'vrej'
    },
    sig: 'dc1027f28bc1ba12f6ef770588cdd1f4',
    nonce: '6129188331007147111'
};
var nonce = obj.nonce;
var sig = signonce.sign(obj, nonce); // undefined nonce = use object's nonce
```

# Extras

`./nk-server-code` contains NK's **actual server code** (not all of them, and not in correct folder structure)
