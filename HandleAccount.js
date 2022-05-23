exports.GenTOKEN = GenTOKEN;
exports.HandleINIT = HandleINIT;
exports.HandleREG = HandleREG;
exports.HandleLOGIN = HandleLOGIN;
var axios = require("axios");
var fs = require("fs");
var users = require("./models/tetr_users");
var DefaultImg = fs.readFileSync("static/imgs/guest.jpg");
var UserImg = fs.readFileSync("static/imgs/newUser.png");
function GenTOKEN(num) {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let Token = "";
    const L = characters.length;
    for (let i = 0; i < num; i++) {
        Token += characters.charAt(Math.floor(Math.random() * L));
    }

    return Token;
}
//R:ReqBody, S:Session
function HandleINIT(S, res) {
    p = new Promise((resolve) => {
        const TOKEN = GenTOKEN(256);
        users
            .findOne({
                where: { UID: S.UID },
            })
            .then((msg) => {
                if (msg != null) {
                    res.send({ TOKEN: TOKEN, UID: msg["UID"], NAME: msg["NAME"], PIC: msg["PIC"], elo: msg["elo"] });
                    resolve({ TOKEN: TOKEN, UID: msg["UID"], NAME: msg["NAME"], PIC: msg["PIC"], elo: msg["elo"] });
                    return;
                }
                resolve(null);
                return;
            });
    });
    return p;
}
async function HandleREG(R, S, res) {
    p = new Promise((resolve) => {
        TOKEN = GenTOKEN(256);
        let RegImg;
        users.findOne({ where: { UID: R.UID } }).then(async (u) => {
            if (u != null) {
                if (R.Method == "Google") {
                    S.NAME = u.NAME;
                    S.UID = u.UID;
                    res.send({ TOKEN: TOKEN, UID: u.UID, NAME: u.NAME, PIC: u.PIC, elo: u.elo });
                    resolve({ TOKEN: TOKEN, UID: u.UID, NAME: u.NAME, PIC: u.PIC, elo: u.elo });
                    return;
                }
                res.send({ TOKEN: false, msg: "Has Been Registered" });
            } else {
                if (R.Method == "Google") {
                    response = await axios.get(R.ICON, { responseType: "arraybuffer" });
                    RegImg = Buffer.from(response.data, "base64");
                } else {
                    RegImg = UserImg;
                }
                S.NAME = R.NAME == undefined ? R.UID : R.NAME;
                S.UID = R.UID;
                users.create({
                    UID: R.UID,
                    PW: R.PW,
                    NAME: S.NAME,
                    PIC: RegImg,
                });
                res.send({ TOKEN: TOKEN, UID: R.UID, NAME: S.NAME, PIC: RegImg, elo: 1000 });
                resolve({ TOKEN: TOKEN, UID: R.UID, NAME: S.NAME, PIC: RegImg, elo: 1000 });
                return;
            }
            resolve(null);
            return;
        });
    });
    return p;
}
function HandleLOGIN(R, S, res) {
    p = new Promise((resolve) => {
        TOKEN = GenTOKEN(256);
        const UID = R.UID;
        const Method = R.Method;

        if (Method == "GuestLogin") {
            res.send({ TOKEN: TOKEN, NAME: "Guest", PIC: DefaultImg });
            resolve({ TOKEN: TOKEN, NAME: "Guest", PIC: DefaultImg });
            return;
        }

        users.findOne({ where: { UID: UID } }).then((u) => {
            if (u != null) {
                if (u.PW == R.PW) {
                    S.username = u.PW;
                    S.UID = u.UID;
                    S.elo = u.elo;
                    res.send({ TOKEN: TOKEN, UID: u.UID, NAME: u.NAME, elo: u.elo, PIC: u.PIC });
                    resolve({ TOKEN: TOKEN, UID: u.UID, NAME: u.NAME, elo: u.elo, PIC: u.PIC });
                    return;
                } else {
                    res.send({ TOKEN: false, msg: "密碼錯誤" });
                }
            } else {
                res.send({ TOKEN: false, msg: "尚未註冊" });
            }
            resolve(null);
            return;
        });
    });
    return p;
}
