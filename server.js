const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const socket = require("socket.io");
const multer = require('multer');
const path = require('path');
const iconvlite = require('iconv-lite');
//var busboy = require('connect-busboy');
var Busboy = require('busboy');
//var TextDecoder = require('TextDecode');
var fs = require("fs");
var http = require("http");
var https = require("https");
const util = require("./utility");
var privateKey = fs.readFileSync("server.key", "utf8");
var certificate = fs.readFileSync("server.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };

const storage = multer.diskStorage({
    destination: __dirname+'static/file/upload/',
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = path.basename(file.originalname, ext);
      if(req.get("host").split(".")[0]=='file'){
        console.log(req.files);
        cb(null, `${filename}${ext}`);
      }
      else
        cb(null, false);
    }
  });
const upload = multer({ storage });

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
app.post("/upload", (req, res) => {
    if(req.get("host").split(".")[0]!='file')
        return;
    var fstream;    
    let upload = Busboy({ headers: req.headers});
    req.pipe(upload);
    upload.on('file', function (fieldname, file, filename) {
        const win = iconvlite.encode(filename.filename, 'ISO8859-1');
        console.log( win.toString());         
        fstream = fs.createWriteStream(__dirname + '/static/file/upload/' + win.toString());
        file.pipe(fstream);
        fstream.on('close', function () {
            
        });
    });
    res.redirect('back');
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