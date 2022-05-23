const web = require("./HandleWeb");
const vote = require("./HandleVote");
const tetr = require("./HandleTetr");

function handleService(service) {
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
    } else if (Domain == "web") {
        if (Type == "get") {
            web.handleWebGet(service);
        }
    }
}
function setService(Type, res, req) {
    return {
        Type: Type,
        Domain: req.get("host").split(".")[0],
        res: res,
        req: req,
        Params: req.params.ServiceToken,
        ReqData: req.params.ReqData,
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
