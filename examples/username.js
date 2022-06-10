const nodefetch = require('node-fetch');
const nksku = require('nksku');
const appID = 11;
const skuID = 35;
const sessionID = null;
const UserAgent = 'btd6-windowsplayer-31';

const deviceID = 'no_link428482bf0b696dcf8ded17e53910b84f9bc99f53';

async function main() {
    let body = {
        method: 'nkapiID',
        keys: ['619c26d089f0080b4f7d854f'],
        includeOnlineStatus: false
    };
    let nonce = Math.random() * Math.pow(2, 63) + ''; // or any hentai code, but there are much less hentai than 64-bit integers

    let bodyString = JSON.stringify(body);

    try {
        let k = await nodefetch('https://api.ninjakiwi.com/user/search', {
            method: 'POST',
            body: JSON.stringify({
                data: bodyString,
                auth: {
                    session: sessionID,
                    appID: appID,
                    skuID: skuID,
                    device: deviceID
                },
                sig: nksku.signonce.sign(body, nonce),
                nonce: nonce
            }),
            headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/json' }
        });
        console.log(await k.json());
    } catch (error) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    }
}
main();
