var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var gplay = require('google-play-scraper');
var fs = require('fs');
var json2xls = require('json2xls');
var COLLECT_BY_ONCE = 20;
var COUNTRY = [
    "us",
    "kr",
    "jp",
];
var CATEGORIES = [
    //gplay.category.APPLICATION,
    //gplay.category.ANDROID_WEAR,
    //gplay.category.ART_AND_DESIGN,
    //gplay.category.AUTO_AND_VEHICLES,
    //gplay.category.BEAUTY,
    //gplay.category.BOOKS_AND_REFERENCE,
    //gplay.category.BUSINESS,
    //gplay.category.COMICS,
    //gplay.category.COMMUNICATION,
    //gplay.category.DATING,
    //gplay.category.EDUCATION,
    //gplay.category.ENTERTAINMENT,
    //gplay.category.EVENTS,
    //gplay.category.FINANCE,
    //gplay.category.FOOD_AND_DRINK,
    //gplay.category.HEALTH_AND_FITNESS,
    //gplay.category.HOUSE_AND_HOME,
    //gplay.category.LIBRARIES_AND_DEMO,
    //gplay.category.LIFESTYLE,
    //gplay.category.MAPS_AND_NAVIGATION,
    //gplay.category.MEDICAL,
    //gplay.category.MUSIC_AND_AUDIO,
    //gplay.category.NEWS_AND_MAGAZINES,
    //gplay.category.PARENTING,
    //gplay.category.PERSONALIZATION,
    //gplay.category.PHOTOGRAPHY,
    //gplay.category.PRODUCTIVITY,
    //gplay.category.SHOPPING,
    //gplay.category.SOCIAL,
    //gplay.category.SPORTS,
    //gplay.category.TOOLS,
    //gplay.category.TRAVEL_AND_LOCAL,
    //gplay.category.VIDEO_PLAYERS,
    //gplay.category.WEATHER,
    gplay.category.GAME,
    gplay.category.GAME_ACTION,
    gplay.category.GAME_ADVENTURE,
    gplay.category.GAME_ARCADE,
    gplay.category.GAME_BOARD,
    gplay.category.GAME_CARD,
    gplay.category.GAME_CASINO,
    gplay.category.GAME_CASUAL,
    gplay.category.GAME_EDUCATIONAL,
    gplay.category.GAME_MUSIC,
    gplay.category.GAME_PUZZLE,
    gplay.category.GAME_RACING,
    gplay.category.GAME_ROLE_PLAYING,
    gplay.category.GAME_SIMULATION,
    gplay.category.GAME_SPORTS,
    gplay.category.GAME_STRATEGY,
    gplay.category.GAME_TRIVIA,
    gplay.category.GAME_WORD,
];
var COLLECTIONS = [
    gplay.collection.TOP_FREE,
    //gplay.collection.TOP_PAID,
    gplay.collection.NEW_FREE,
];
let COLLECTED_GOOGLE_PLAY_APP_LIST = {};
let COLLECTED_GOOGLE_PLAY_APP_DETAILS = {};
let NUM_TOTAL_COLLECTED = 0;
let CollectGooglePlayAppList_Internal = (country, collection, category) => __awaiter(this, void 0, void 0, function* () {
    var items = [];
    var tasks = [];
    for (var start = 0; start < 500; start += 100) {
        tasks.push(gplay.list({
            category: category,
            collection: collection,
            num: 100,
            start: start,
            country: country,
        }));
    }
    yield Promise.all(tasks)
        .then((responses) => {
        for (var it in responses) {
            items = items.concat(responses[it]);
        }
    })
        .catch((reason) => { console.log(reason); });
    return items;
});
// 구글 앱 목록 긁어오기
let CollectGooglePlayAppList = (countries, collections, categories) => __awaiter(this, void 0, void 0, function* () {
    console.log('BEGIN COLLECT APP LIST');
    var result = {};
    NUM_TOTAL_COLLECTED = 0;
    let totalCount = countries.length * collections.length * categories.length;
    let collectedCount = 0;
    for (var it_country in countries) {
        for (var it_collection in collections) {
            for (var it_category in categories) {
                let country = countries[it_country];
                let collection = collections[it_collection];
                let category = categories[it_category];
                if (result[country] == null) {
                    result[country] = {};
                }
                if (result[country][collection] == null) {
                    result[country][collection] = {};
                }
                let apps = yield CollectGooglePlayAppList_Internal(country, collection, category);
                result[country][collection][category] = apps;
                collectedCount += 1;
                ;
                NUM_TOTAL_COLLECTED += apps.length;
                console.log('[' + collectedCount + '/' + totalCount + ']', country, collection, category);
            }
        }
    }
    console.log('END COLLECT APP LIST');
    return result;
});
let CollectGooglePlayAppDetailsByAppList = (apps, exportToExcel, filename) => __awaiter(this, void 0, void 0, function* () {
    console.log('BEGIN COLLECT APP DETAILS');
    let collectedCount = 0;
    var result = {};
    for (var country in apps) {
        let collections = apps[country];
        for (var collection in collections) {
            let categories = collections[collection];
            for (var category in categories) {
                let items = categories[category];
                if (result[country] == null) {
                    result[country] = {};
                }
                if (result[country][collection] == null) {
                    result[country][collection] = {};
                }
                if (result[country][collection][category] == null) {
                    result[country][collection][category] = [];
                }
                var len = items.length;
                var arr = [];
                var processCountOnce = Math.min(Math.max(COLLECT_BY_ONCE, 1), 200);
                for (var itemIdx = 0; itemIdx < len; itemIdx += processCountOnce) {
                    let tasks = [];
                    for (var idx = 0; idx < Math.min(processCountOnce, len - itemIdx); ++idx) {
                        let item = items[idx + itemIdx];
                        let appId = item['appId'];
                        tasks.push(gplay.app({ appId: appId, }));
                    }
                    yield Promise.all(tasks).then((responses) => {
                        arr = arr.concat(responses);
                        for (var i = 0; i < responses.length; ++i) {
                            console.log('[' + collectedCount + '/' + NUM_TOTAL_COLLECTED + ']', country, collection, category, responses[i].appId);
                            ++collectedCount;
                        }
                    }).catch((reason) => {
                        console.log(reason);
                        collectedCount += tasks.length;
                    });
                }
                result[country][collection][category] = arr;
                if (exportToExcel) {
                    var xls = json2xls(arr);
                    var excelFileName = filename;
                    excelFileName += '.';
                    excelFileName += collection;
                    excelFileName += '.';
                    excelFileName += category;
                    excelFileName += '.';
                    excelFileName += country;
                    excelFileName += '.xlsx';
                    fs.writeFileSync(excelFileName, xls, 'binary');
                }
            }
        }
    }
    console.log('END COLLECT APP DETAILS');
    return result;
});
const mkdirSync = function (dirPath) {
    try {
        fs.mkdirSync(dirPath);
    }
    catch (err) {
        if (err.code !== 'EEXIST')
            throw err;
    }
};
let run = () => __awaiter(this, void 0, void 0, function* () {
    mkdirSync('output');
    let appList = yield CollectGooglePlayAppList(COUNTRY, COLLECTIONS, CATEGORIES);
    let appDetails = yield CollectGooglePlayAppDetailsByAppList(appList, true, './output/GooglePlayApps');
    //for (var country in appDetails) {
    //	let filename = 'GooglePlayApps.' + country + '.json';
    //	fs.writeFileSync(filename, JSON.stringify(appDetails[country]), 'utf8');
    //}
    pressAnyKey();
});
function pressAnyKey() {
    console.log('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}
function parseOptionFromFile(fname) {
    let text = fs.readFileSync(fname, 'utf8');
    try {
        let jOptions = JSON.parse(text.trim());
        if (jOptions["COLLECT_BY_ONCE"] != null) {
            COLLECT_BY_ONCE = jOptions["COLLECT_BY_ONCE"];
        }
        if (jOptions["COUNTRY"] != null) {
            COUNTRY = jOptions["COUNTRY"];
        }
        if (jOptions["CATEGORIES"] != null) {
            CATEGORIES = jOptions["CATEGORIES"];
        }
        if (jOptions["COLLECTIONS"] != null) {
            COLLECTIONS = jOptions["COLLECTIONS"];
        }
    }
    catch (reason) {
        console.log(reason);
    }
}
function parseToCommand() {
    for (let i = 0; i < process.argv.length; ++i) {
        let command = process.argv[i];
        if (command == '-config') {
            let fname = process.argv[++i];
            parseOptionFromFile(fname);
        }
    }
}
parseToCommand();
run();
//pressAnyKey();
//yield run((result: object) => {
//	console.log('Press any key to exit');
//	process.stdin.setRawMode(true);
//	process.stdin.resume();
//	process.stdin.on('data', process.exit.bind(process, 0));
//});
//# sourceMappingURL=app.js.map