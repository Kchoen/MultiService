var socket;
let MYTOKEN;
let PersonalData = {};
var RankData;
var isLast;
var abc = { a: 0, b: 0, c: 0 };

axios.get("/LOGINSTATE").then((response) => {
    r = response.data;
    if (r.TOKEN != false) {
        MYTOKEN = r.TOKEN;
        PersonalData = { TOKEN: r.TOKEN, UID: r.UID, NAME: r.NAME, elo: r.elo };
        toLoginPage(r.TOKEN);
    } else {
        toFirstPage();
    }
});
