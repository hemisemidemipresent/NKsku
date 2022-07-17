let obj = {
    index: 'challenges',
    query: {
        bool: {
            must_not: [
                { match: { pageFile: true } },
                { match: { isUnlosable: true } },
                { match: { isUnwinable: true } },
                { match: { isDeleted: true } }
            ],
            filter: [
                {
                    script: {
                        script: {
                            lang: 'painless',
                            source: "doc['gameVersionNumber'].value <= params['version']  && (doc['gameVersionNumber'].value >= params['version']  || doc['latestVersionBeaten'].value >= params['version'] )",
                            params: { version: 310200 }
                        }
                    }
                },
                {
                    script: {
                        script: {
                            lang: 'painless',
                            source: "doc['stats.upvotes'].value >= params['upvotes']  && doc['stats.winsUnique'].value >= params['winsUnique']  && doc['stats.losses'].value >= params['losses']  && doc['stats.plays'].value + doc['stats.restarts'].value >= params['attempts']  && (1.0 * doc['stats.wins'].value) / (1.0 * (doc['stats.plays'].value + doc['stats.restarts'].value))<= params['winRate'] ",
                            params: { upvotes: 2, winsUnique: 1, losses: 3, attempts: 8, winRate: 0.35 }
                        }
                    }
                }
            ]
        }
    },
    options: {
        sort: [
            {
                _script: {
                    type: 'number',
                    order: 'desc',
                    script: {
                        lang: 'painless',
                        source: "(1.0 - ((1.0 * doc['stats.wins'].value) / (1.0 * (doc['stats.plays'].value + doc['stats.restarts'].value)))) * (1.0 * 1) + ((1.0 * doc['stats.upvotes'].value) / (1.0 * doc['stats.playsUnique'].value) * (1.0 * 1))",
                        params: {}
                    }
                }
            }
        ],
        search_type: 'query_then_fetch'
    },
    limit: 35,
    offset: 0,
    hint: 'expert'
};

const nodefetch = require('node-fetch');
const nksku = require('nksku');
const appID = 11;
const skuID = 35;
const sessionID = null;
const UserAgent = 'btd6-windowsplayer-31';

const deviceID = null;

async function main() {
    console.log(await request(obj));
}

main();

async function request(body) {
    let nonce = Math.random() * Math.pow(2, 63) + ''; // or any hentai code, but there are much less hentai than 64-bit integers (for now)

    let bodyString = JSON.stringify(body);

    try {
        let k = await nodefetch('https://api.ninjakiwi.com/utility/es/search/full', {
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
        return await k.json();
    } catch (error) {
        console.log(error);
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
    }
}
