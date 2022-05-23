var axios = require("axios");
var Buffer = require("buffer").Buffer;
var socket = require("socket.io");
var fs = require("fs");
var DefaultImg = fs.readFileSync("static/imgs/guest.jpg");
const util = require("./HandleAccount");
const { TetrDB } = require("./util/database");
const users = require("./models/tetr_users");
var Token2Info = {},
    WaitingTokens = {},
    io;
function init(httpsServer) {
    TetrDB.sync({ force: false });
    io = socket(httpsServer);
    setSocket();
    setMatch();
}
function setSocket() {
    io.on("connection", (socket) => {
        let myToken;
        console.log("User connected : " + socket.id);
        socket.on("queuing", (token) => {
            myToken = token;
            Token2Info[myToken]["socket"] = socket;
            WaitingTokens[myToken] = { startWaiting: new Date().getTime(), elo: Token2Info[myToken].elo };
        });

        socket.on("disconnect", () => {
            delete WaitingTokens[myToken];
        });
    });
}
const setMatch = () => {
    let p1 = [];
    let p2 = [];
    let tokens = Object.entries(WaitingTokens);
    const now = new Date().getTime();
    for (let i = 0; i < tokens.length; i++) {
        const [token1, detail1] = tokens[i];
        const waited1 = (now - detail1.startWaiting) / 1000;
        Token2Info[token1]["socket"].emit("waitedTime", { TIME: waited1 | 0, NUM: tokens.length });

        if (p2.indexOf(token1) > -1) continue;

        for (let j = i + 1; j < tokens.length; j++) {
            const [token2, detail2] = tokens[j];
            const elo1 = detail1.elo == null ? 1000 : detail1.elo;
            const elo2 = detail2.elo == null ? 1000 : detail2.elo;
            const elo_diff = Math.abs(elo1 - elo2);
            const waited2 = (now - detail2.startWaiting) / 1000;
            if (elo_diff < waited1 * 10 && elo_diff < waited2 * 10) {
                p1.push(token1);
                p2.push(token2);
                break;
            }
        }
    }
    for (let i = 0; i < p1.length; i++) {
        new Game(p1[i], p2[i]);
        delete WaitingTokens[p1[i]];
        delete WaitingTokens[p2[i]];
    }
    setTimeout(setMatch, 250);
};
function handleTetrGet(service) {
    let res = service.res;
    let req = service.req;
    if (service.Params == undefined) {
        res.sendFile("tetr_index.html", { root: __dirname + "/templates" });
    } else if (service.Params == "RANKING") {
        left = req.query.left;
        right = req.query.right;
        if (left != undefined && right != undefined) {
            sliceRank(left, right).then((rankList) => {
                isLast = rankList.isLast;
                rankList = mergeList([], rankList.questList, left, right, undefined);
                res.send({ rankList: rankList, isLast: isLast });
            });
        } else {
            handle_rankingList(req.session.UID).then((rankList) => {
                res.send(rankList);
            });
        }
    } else if (service.Params == "LOGINSTATE") {
        s = req.session;
        if (s.UID == undefined) {
            res.send({ TOKEN: false });
        } else {
            util.HandleINIT(s, res).then((Handle) => {
                if (Handle != null) {
                    Token2Info[Handle.TOKEN] = Handle;
                } else {
                    s = undefined;
                    res.send({ TOKEN: false });
                }
            });
        }
    } else if (service.Params == "Image.png") {
        UID = req.session.UID;
        if (UID == undefined) {
            res.send(DefaultImg);
        } else {
            users
                .findOne({
                    where: { UID: UID },
                })
                .then((msg) => {
                    try {
                        res.send(msg["PIC"]);
                    } catch (e) {
                        res.send(DefaultImg);
                    }
                });
        }
    } else if (service.Params == "favicon.ico") {
        res.sendFile("ricardo.ico", { root: __dirname + "/static" });
    }
}
async function handleTetrPost(service) {
    res = service.res;
    req = service.req;
    r = req.body;
    s = req.session;
    if (r.PTYPE == "logout") {
        s.destroy((err) => {
            res.send("success");
        });
    } else if (r.PTYPE == "login") {
        Handle = await util.HandleLOGIN(r, s, res);
        if (Handle != null) {
            Token2Info[Handle.TOKEN] = Handle;
        }
    } else if (r.PTYPE == "reg") {
        Handle = await util.HandleREG(r, s, res);
        if (Handle != null) {
            Token2Info[Handle.TOKEN] = Handle;
        }
    } else if (r.PTYPE == "ChangePIC") {
        const buffer = Buffer.from(r.file, "binary");
        let UID = r.UID;
        users.update({ PIC: buffer }, { where: { UID: UID } });
        res.send(true);
    } else if (r.PTYPE == "ChangeName") {
        let newName = r.newName;
        let UID = r.UID;

        users.update({ NAME: newName }, { where: { UID: UID } });
        res.send(true);
    } else if (r.PTYPE == "ChangePW") {
        let newPW = r.newPW;
        let UID = r.UID;

        users.update({ PW: newPW }, { where: { UID: UID } });
        res.send(true);
    }
}

function sliceRank(left, right) {
    let isLast = false;
    p = new Promise((resolve) => {
        users
            .findAll({
                attributes: ["id"],
                order: [
                    ["elo", "DESC"],
                    ["id", "ASC"],
                ],
            })
            .then((eloList) => {
                QueryList = eloList.map((elem) => elem["id"]);
                if (left >= QueryList.length) {
                    left = QueryList.length - 1;
                    isLast = true;
                }
                if (right > QueryList.length) {
                    right = QueryList.length;
                    isLast = true;
                }
                nextQuery = QueryList.slice(left, right);
                users
                    .findAll({
                        where: { id: nextQuery },
                        order: [
                            ["elo", "DESC"],
                            ["id", "ASC"],
                        ],
                    })
                    .then((questList) => {
                        resolve({ questList: questList, isLast: isLast });
                    });
            });
    });
    return p;
}

function handle_rankingList(UID) {
    let uIndex = undefined,
        left = undefined,
        right = undefined,
        isLast = false;
    p = new Promise((resolve) => {
        let end3 = undefined;

        users
            .findAll({
                attributes: ["UID"],
                order: [
                    ["elo", "DESC"],
                    ["id", "ASC"],
                ],
            })
            .then((eloList) => {
                if (UID != undefined) {
                    QueryList = eloList.map((elem) => elem["UID"]);
                    uIndex = QueryList.indexOf(UID);
                    left = uIndex - 1 < 0 ? 0 : uIndex - 1;
                    right = uIndex + 2;
                    if (uIndex + 2 > QueryList.length) {
                        right = QueryList.length;
                        isLast = true;
                    }

                    end3 = sliceRank(left, right);
                }
                top5 = sliceRank(0, 5);
                qList = [top5];
                if (UID != undefined) {
                    qList.push(end3);
                }
                Promise.all(qList).then((querys) => {
                    top5 = querys[0].questList;
                    if (UID != undefined) {
                        end3 = querys[1].questList;
                    }
                    rankList = mergeList(top5, end3, left, right, uIndex);
                    resolve({ rankList: rankList, isLast: isLast });
                });
            });
    });
    return p;
}
function mergeList(top5, end3, left, right, PlayerRank) {
    left = parseInt(left);
    right = parseInt(right);
    rankList = [];
    FINDED = false;
    for (t in top5) {
        r = top5[t];
        rankList.push({ rNum: t, name: r.NAME, elo: r.elo, img: r["PIC"] });
    }
    for (let i = left; i < right; i++) {
        r = end3[i - left];
        if (r == undefined) break;
        if (i >= 5) rankList.push({ rNum: i, name: r.NAME, elo: r.elo, img: r["PIC"] });
    }
    if (PlayerRank != undefined) {
        if (PlayerRank >= 5) {
            try {
                rankList[PlayerRank - left + 5]["PLAYER"] = true;
            } catch (e) {}
        } else {
            try {
                rankList[PlayerRank].PLAYER = true;
            } catch (e) {}
        }
    }
    return rankList;
    // if (FINDED == 4) {
    //     if (end3.length == 3) {
    //         rankList.push({ name: end3[2].NAME, elo: end3[2].elo, img: end3[2]["PIC"] });
    //     }
    // }
}

class Game {
    constructor(token1, token2) {
        this.player1 = { KO: 0, SentLines: 0 };
        this.player2 = { KO: 0, SentLines: 0 };

        this.token1 = token1;
        this.token2 = token2;
        var socket1 = Token2Info[token1].socket;
        var socket2 = Token2Info[token2].socket;
        this.socket1 = socket1;
        this.socket2 = socket2;

        this.playerData1 = { UID: Token2Info[token1].UID, name: Token2Info[token1].NAME, img: Token2Info[token1].PIC, elo: Token2Info[token1].elo };
        this.playerData2 = { UID: Token2Info[token2].UID, name: Token2Info[token2].NAME, img: Token2Info[token2].PIC, elo: Token2Info[token2].elo };

        this.launch_socket(socket1, socket2, this.player1, this.player2);
        this.launch_socket(socket2, socket1, this.player2, this.player1);

        let CreationData1 = { img: this.playerData1.img, name: this.playerData1.name, elo: Token2Info[token1].elo };
        let CreationData2 = { img: this.playerData2.img, name: this.playerData2.name, elo: Token2Info[token2].elo };
        socket1.emit("CreateGame", { player1: CreationData1, player2: CreationData2 });
        socket2.emit("CreateGame", { player1: CreationData2, player2: CreationData1 });

        this.isEnd = false;
        const game_length = 120 * 1000;
        // const game_length = 10 * 1000;
        const game_length_fq = 100;
        let endTime;
        const countdowngame = () => {
            if (this.isEnd) return;
            const currentTime = new Date().getTime();
            var remTime = endTime - currentTime;
            if (remTime < 0) {
                this.handleGameOver(socket1, socket2);
                return;
            }
            setTimeout(() => {
                countdowngame();
            }, game_length_fq);

            const m = (remTime / 60000) | 0;
            remTime -= m * 60000;
            const s = (remTime / 1000) | 0;
            remTime -= s * 1000;
            const ms1 = (remTime / 100) | 0;
            const t = m + " : " + ("0" + s).slice(-2) + "." + ms1;
            socket1.emit("CountDownGame", t);
            socket2.emit("CountDownGame", t);
        };

        const countdown = (n) => {
            if (this.isEnd) return;
            if (n == 0) {
                socket1.emit("StartGame");
                socket2.emit("StartGame");
                endTime = new Date().getTime() + game_length;
                countdowngame();
                return;
            }
            setTimeout(() => {
                countdown(n - 1);
            }, 1000);
            socket1.emit("CountDownStart", n);
            socket2.emit("CountDownStart", n);
        };

        setTimeout(() => {
            countdown(3);
        }, 1000);
    }

    handleGameOver() {
        this.isEnd = true;

        this.socket1.emit("GameOver");
        this.socket1.once("Result", (data) => {
            this.player1.SentLines = data["myLine"];
            this.player2.KO = data["oppoKO"];

            this.socket2.emit("GameOver");
            this.socket2.once("Result", (data) => {
                this.player2.SentLines = data["myLine"];
                this.player1.KO = data["oppoKO"];

                let winner = 0;
                if (this.player1.KO > this.player2.KO) {
                    winner = 1;
                } else if (this.player1.KO < this.player2.KO) {
                    winner = 2;
                } else if (this.player1.SentLines > this.player2.SentLines) {
                    winner = 1;
                } else if (this.player1.SentLines < this.player2.SentLines) {
                    winner = 2;
                }
                if (winner == 1) {
                    this.handleElo(1, 0);
                    this.socket1.emit("Result", "You Win");
                    this.socket2.emit("Result", "You Lose");
                } else if (winner == 2) {
                    this.handleElo(0, 1);
                    this.socket1.emit("Result", "You Lose");
                    this.socket2.emit("Result", "You Win");
                } else {
                    this.handleElo(0.5, 0.5);
                    this.socket1.emit("Result", "Tie");
                    this.socket2.emit("Result", "Tie");
                }
            });
        });
    }

    handleElo(S1, S2) {
        var r1 = this.playerData1.elo == null ? 1000 : this.playerData1.elo;
        var r2 = this.playerData2.elo == null ? 1000 : this.playerData2.elo;
        let E1 = 1 / (1 + 10 ** ((r2 - r1) / 400));
        let E2 = 1 / (1 + 10 ** ((r1 - r2) / 400));
        let R1 = r1 + 32 * (S1 - E1);
        let R2 = r2 + 32 * (S2 - E2);
        if (this.playerData1.elo != null) {
            users.update({ elo: R1 }, { where: { UID: this.playerData1.UID } });
        }
        if (this.playerData2.elo != null) {
            users.update({ elo: R2 }, { where: { UID: this.playerData2.UID } });
        }
    }

    handleBadPlayer(socket_winner, player_winner) {
        this.isEnd = true;
        if (player_winner == this.player1) {
            this.handleElo(1, 0);
        } else {
            this.handleElo(0, 1);
        }

        socket_winner.emit("GameOver");
        socket_winner.emit("Result", "You Win! Your opponent has gone offline.");
    }

    launch_socket(socket_a, socket_b, player_a, player_b) {
        socket_a.on("playerData", (data) => {
            //////////////////////////////////////////
            /*


                Write synchronize validation here


                                                    */
            //////////////////////////////////////////
            // if (data["LINES"]) {
            //     player_a.SentLines += data["LINES"];
            // }
            // if (data["KO"]) {
            //     player_b.KO += data["KO"];
            // }
            socket_b.emit("playerData", data);
        });
        socket_a.once("disconnect", () => {
            socket_a.disconnect();
            if (!this.isEnd) {
                this.handleBadPlayer(socket_b, player_b);
            }
        });
        socket_a.once("suicide", () => {
            this.isEnd = true;
            if (player_b == this.player1) {
                this.handleElo(1, 0);
            } else {
                this.handleElo(0, 1);
            }

            socket_b.emit("GameOver");
            socket_b.emit("Result", "You Win!");
            socket_a.emit("GameOver");
            socket_a.emit("Result", "You Lose!");
        });
    }
}

module.exports = {
    init: init,
    handleTetrGet: handleTetrGet,
    handleTetrPost: handleTetrPost,
};
