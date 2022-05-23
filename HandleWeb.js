function handleWebGet(service) {
    res = service.res;
    if (service.Params == undefined) {
        res.sendFile("web_index.html", { root: __dirname + "/templates" });
    }
}
module.exports = {
    handleWebGet: handleWebGet,
};
