const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const socket = require("socket.io");
var fs = require("fs");
var http = require("http");
var https = require("https");
const util = require("./utility");
var privateKey = fs.readFileSync("server.key", "utf8");
var certificate = fs.readFileSync("server.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };

util.voteInit();
const sess = {
    secret: "secretsecretsecret",
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: false,
};

const app = express();
// static files
app.use(express.static("static"));
app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));

if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sess.cookie.secure = true;
}

app.use(session(sess));

app.get("/", (req, res) => {
    util.handleService(util.setService("get", res, req));
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile("ricardo.ico", { root: __dirname + "/static" });
});

app.get("/:ServiceToken", (req, res) => {
    util.handleService(util.setService("get", res, req));
});
app.get("/:ServiceToken/:ReqData", (req, res) => {
    util.handleService(util.setService("get", res, req));
});

app.post("/", function (req, res) {
    util.handleService(util.setService("post", res, req));
});

app.post("/:ServiceToken", (req, res) => {
    util.handleService(util.setService("post", res, req));
});

app.delete("/:ServiceToken/:ReqData",(req,res)=>{
    util.handleService(util.setService("delete", res, req));
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);
util.tetrInit(httpsServer);