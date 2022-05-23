const Sequelize = require("sequelize");
const { events } = require("./models/vote_events");
const { VoteDB } = require("./util/database");
const { createEvent } = require("./models/vote_events");
const { StartPolling, BackupPolling } = require("./models/vote_polling.js");
var tokenTables = {};
function GenTOKEN(num) {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let Token = "";
    const L = characters.length;
    for (let i = 0; i < num; i++) {
        Token += characters.charAt(Math.floor(Math.random() * L));
    }

    return Token;
}

function handleVoteGet(service) {
    res = service.res;
    req = service.req;
    if (service.Params == undefined) {
        //send Start_Poll html
        res.sendFile("vote_index.html", { root: __dirname + "/templates" });
    } else {
        Token = service.Params;
        Session = req.session;
        //send Poll_select data
        if (service.ReqData == "selections.json") {
            try {
                LoadVoteTable(tokenTables[Token], Token, res);
            } catch (e) {
                res.send({ success: false });
            }
        }
        //send Poll_topic data
        else if (service.ReqData == "title.json") {
            try {
                LoadVoteTopic(Token, Session.username, res);
            } catch (e) {
                res.send({ success: false });
            }
        }
        //send Poll_page html
        else {
            res.sendFile("vote_polling.html", { root: __dirname + "/templates" });
        }
    }
}
async function handleVotePost(service) {
    res = service.res;
    req = service.req;
    if (service.Params == undefined) {
        let r = req.body;
        Title = r.Title;
        TimeSchema = r.TimeSchema;
        OtherTopic = r.OtherTopic;
        OtherSchema = r.OtherSchema;
        Token = GenTOKEN(16);
        createEvent(Token, Title, TimeSchema, OtherTopic, OtherSchema);
        StartPolling(Token, TimeSchema, OtherSchema).then((polling) => {
            tokenTables[Token] = polling;
            res.send(Token);
        });
    } else {
        Session = req.session;
        polling = tokenTables[service.Params];
        r = req.body;
        if (Session.username == undefined) {
            const username = r.U;
            const password = r.P;
            polling
                .findAll({
                    where: { username: username },
                })
                .then((msgs) => {
                    if (msgs.length > 0) {
                        msg = msgs[0];
                        if (msg.password == password) {
                            Session.username = username;
                            res.send("success");
                        } else {
                            res.send("failed");
                        }
                    } else {
                        Session.username = username;
                        polling.create({
                            username: username,
                            password: password,
                        });
                        res.send("success");
                    }
                });
        } else if (r.data == "pressed") {
            updateDict = {};
            updateDict[r.option] = Sequelize.literal(`IF ('${r.option}'='o','x','o')`);
            polling.update(updateDict, { where: { username: Session.username } }).then(() => {
                res.send("success");
            });
        } else if (r.data == "logout") {
            Session.destroy((err) => {
                res.send("success");
            });
        }
    }
}

function LoadVoteTable(polling, token, res) {
    days = [];
    TimeSchema = {};
    TimeHolder = {};
    OtherSchema = [];
    OtherHolder = {};
    usernames = [];
    return_dict = {};
    events
        .findOne({
            where: {
                TOKEN: token,
            },
            attribute: ["TimeSchema", "OtherSchema", "OtherTopic"],
        })
        .then((e) => {
            for (t of e.TimeSchema) {
                TimeHolder[t] = [];
                time = t.split(" : ");
                day = time[0];
                time = time[1];
                if (!days.includes(day)) {
                    days.push(day);
                    TimeSchema[day] = [];
                }
                TimeSchema[day].push(time);
            }
            for (o of e.OtherSchema) {
                OtherSchema.push(o);
                OtherHolder[o] = [];
            }
            polling.findAll().then((msgs) => {
                for (p of msgs) {
                    username = p.username;
                    usernames.push(username);
                    for (t of e.TimeSchema) {
                        if (p[t] == "o") {
                            TimeHolder[t].push(username);
                        }
                    }
                    for (o of e.OtherSchema) {
                        if (p[o] == "o") {
                            OtherHolder[o].push(username);
                        }
                    }
                }
                return_dict["success"] = true;
                return_dict["days"] = days;
                return_dict["TimeSchema"] = TimeSchema;
                return_dict["TimeHolder"] = TimeHolder;
                return_dict["OtherTopic"] = e.OtherTopic;
                return_dict["OtherSchema"] = OtherSchema;
                return_dict["OtherHolder"] = OtherHolder;
                return_dict["usernames"] = usernames;
                res.send(return_dict);
            });
        })
        .catch((err) => {
            console.log("Table havent created");
        });
}

function LoadVoteTopic(token, name, res) {
    wrong_password = false;
    usrName = name == undefined ? "" : name;
    loginState = name == undefined ? false : true;

    events
        .findOne({
            where: {
                TOKEN: token,
            },
        })
        .then((e) => {
            return_dict = {
                success: true,
                wrong_password: wrong_password,
                loginState: loginState,
                usr: usrName,
                Title: e.Title,
            };
            res.send(return_dict);
        })
        .catch((err) => {
            console.log("Table havent created");
        });
}
function BackupTables() {
    console.log("Backuping...");
    events.findAll({}).then(async function (es) {
        tokenTables = {};
        for (let e of es) {
            polling = await BackupPolling(e.TOKEN, e.TimeSchema, e.OtherSchema);
            tokenTables[e.TOKEN] = polling;
        }
        console.log("BACKUP COMPLETE");
        console.log(`Current On-going Vote : ${Object.keys(tokenTables).length}`);
    });
}
async function Backup() {
    VoteDB.sync({ force: false }).finally(() => {
        console.log("STARTING BACKUP");
        BackupTables();
    });
}
module.exports = {
    handleVoteGet: handleVoteGet,
    handleVotePost: handleVotePost,
    Backup: Backup,
};
