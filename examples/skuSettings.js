let nksku = require('nksku');
let fetch = require('node-fetch');
fetch('https://static-api.nkstatic.com/nkapi/skusettings/752e866bde3d94b5a160795bf011688b.json', {
    encoding: null
})
    .then((res) => res.buffer())
    .then((body) => {
        let decodedBody = nksku.dgdata.decode(body).toString('utf-8');
        console.log(decodedBody);
    });
