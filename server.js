let nksku = require('./index');
let request = require('request');
request(
    'https://static-api.nkstatic.com/nkapi/skusettings/752e866bde3d94b5a160795bf011688b.json',
    { encoding: null },
    (err, res, body) => {
        let decodedBody = nksku.dgdata.decode(body).toString('utf-8');
        console.log(decodedBody);
    }
);
