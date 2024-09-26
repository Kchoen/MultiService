const web = require("./HandleWeb");
const vote = require("./HandleVote");
const tetr = require("./HandleTetr");
const file = require("./HandleFile");


function handleService(service) {
    if(service.Domain == undefined){
        pass
    }
    Domain = service.Domain;
    Type = service.Type;
    if (Domain == "vote") {
        if (Type == "get") {
            vote.handleVoteGet(service);
        } else {
            vote.handleVotePost(service);
        }
    } else if (Domain == "tetr") {
        if (Type == "get") {
            tetr.handleTetrGet(service);
        } else {
            tetr.handleTetrPost(service);
        }
    } else if (Domain == "www") {
        if (Type == "get") {
            web.handleWebGet(service);
        }
    }else if (Domain == "file") {
        if (Type == "get") {
            file.handleFileGet(service);
        }
        else if (Type == "post") {
            file.handleFilePost(service);
        }
        if (Type == "delete") {
            file.handleFileDelete(service);
        }
    } else {
        // service.res.redirect("https://www.kchoen.com");
        if (Type == "get") {
            web.handleWebGet(service);
        }
    }
}
function setService(Type, res, req) {
    dom = req.get("host").split(".")[0]
    if (req.get("host").split(".").length==2) dom = "redirect";
    if(["vote","tetr","www","file"].includes(dom))
        return {
            Type: Type,
            Domain: dom,
            res: res,
            req: req,
            Params: req.params.ServiceToken,
            ReqData: req.params.ReqData,
        };
    else {
        return {
            Type: Type,
            Domain: "redirect",
            res: res,
        }
    };
}
function voteInit() {
    vote.Backup();
}
function tetrInit(httpsServer) {
    tetr.init(httpsServer);
}
module.exports = {
    handleService: handleService,
    voteInit: voteInit,
    tetrInit: tetrInit,
    setService: setService,
};
