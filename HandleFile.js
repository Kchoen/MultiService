const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'upload/',
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = path.basename(file.originalname, ext);
      cb(null, `${filename}${ext}`);
    }
  });
const upload = multer({ storage });

function handleFileGet(service) {
    res = service.res;
    if (service.Params == undefined) {
        res.sendFile("file_index.html", { root: __dirname + "/templates" });
    } else if(service.ReqData == undefined) {
        if(service.Params == 'list-files'){
            console.log("list-files/sent: "+res.headersSent);
            try{
                fs.readdir(path.join(__dirname, 'static/file/upload'), async function(err,files){
                    console.log(files);
                    await res.json(files);
                    return;
                });
                
            } catch(err){
                console.error(err);
                return;
            }
           
        } else if(service.Params == 'comments') {
            try{
                fs.readFile(__dirname + "/static/file/comments.json",async function(err,files){
                    cmdata = JSON.parse(files);
                    if(res.headersSent!=true){
                        await res.json(cmdata);
                    }
                    return;
                });
                
                
            } catch(err){
                console.error(err);
                return;
            }

        }
    } else {
        const dfile = path.join(__dirname, 'static/file/upload', service.ReqData);
        res.download(dfile, (err) => {
            if (err) {
            console.error(err);
            return;
            }
        });
    }
}
function handleFilePost(service) {
    res = service.res;
    const { name, comment } = service.req.body;
    console.log(service.req.body);
    // Create a new comment object with a unique ID
    const newComment = {
        id: Date.now(),
        name: name,
        comment: comment,
    };

    // Save the new comment to a JSON file
    fs.readFile(__dirname + "/static/file/comments.json", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to read comments file');
        }
        let comments = JSON.parse(data);
        comments.push(newComment);
        fs.writeFile(__dirname + "/static/file/comments.json", JSON.stringify(comments), err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to write comments file');
        }

        res.status(201).json(newComment);
        });
    });
}
function handleFileDelete(service) {
    res = service.res;
    const commentId = parseInt(service.ReqData);
    console.log(service.ReqData)
    fs.readFile(__dirname + "/static/file/comments.json", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to read comments file');
        }

        const comments = JSON.parse(data);
        const filteredComments = comments.filter(comment => comment.id !== commentId);

        fs.writeFile(__dirname + "/static/file/comments.json", JSON.stringify(filteredComments), err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to write comments file');
        }

        res.sendStatus(204);
        });
    });
}

module.exports = {
    handleFileGet: handleFileGet,
    handleFilePost: handleFilePost,
    handleFileDelete: handleFileDelete,
};