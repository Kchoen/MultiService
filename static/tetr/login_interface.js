function toFirstPage() {
    $("#body").empty();
    $("#body").append(get_banner());
    $("#body").append(
        $(`
        <div style="height: 12.5vh"></div>
        <div id="RANK" class="RANK"></div>
        <div align="center" style="float:left; width: 55%; height: 80vh; margin-top: 7.5vh">
            <div align="center"><button onclick="PlayAsGuest()" class="startBTN">Start as Guest</button></div>
            <br>
            <div>
                <h2 align="center">登入</h2>
                <table style="color: var(--input-front)" style="font-size: 3vh">
                    <tr>
                        <td>帳號：</td>
                        <td align="left"><input id="U" type="text" style="width: 150px" /></td>
                    </tr>
                    <tr>
                        <td>密碼：</td>
                        <td><input id="P" type="password" style="width: 150px" /></td>
                        <td id="wrongpw" style="color: red; display: none">Wrong password</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><input value="登入" type="submit" onclick="SendUserPassword()" style="font-size: 18px; width: 150px" /></td>
                    </tr>
                </table>
            </div>
            <br>
            
            
        </div>`)
    );
    initRank();
}

function toLoginPage(token) {
    $(document.body).empty();
    $(document.body).append(get_banner(PersonalData.NAME));
    $(document.body).append(
        $(`
        <div style="height: 12.5vh"></div>
        <div id="RANK" class="RANK"></div>
        <div align="center" style="float:left; width: 55%; height: 80vh; margin-top: 7.5vh">


            <div align="left" style="margin-top: 5px">
                <img src="Image.png" width="150" height="150" style="float: left; margin-left: 25%">
                <div style="float: left; margin-left: calc(0)">
                    <div> &nbsp 使用者名稱： &nbsp ${PersonalData.NAME} </div>
                    <div> &nbsp ID： &nbsp ${PersonalData.UID} </div>
                    <div> &nbsp 積分： &nbsp ${PersonalData.elo} </div>
                </div>
            </div>

            <div style="clear: left"></div>

            <div align="center" style="margin-top: 25px"> <button onclick="search_oppenent()" class="startBTN">Start</button> </div>
            <div align="center" style="margin-top: 25px" id="logout"> <button onclick="pressLogout()">登出</button> </div>
        </div>`)
    );
    MYTOKEN = token;
    initRank();
}

function search_oppenent() {
    $(document.body).empty();
    $(document.body).append(get_banner(PersonalData.NAME));
    $(document.body).append(
        $(`
        <div style="height: 12.5vh"></div>
        <div align="center" id="waitingSection">
            <h2 align="center">Waiting for another Player</h2>
            <h2 align="center">Waited &nbsp <span id="waitedTime"> 0 </span> &nbsp Seconds</h2>
            <div align="center">
                <img src="blocks/pKopwXp.gif" alt="loading..." />
            </div>
            <img src="Image.png" width="120px" height="120px" alt="一張圖片">
            <br>
            <h2 id="QNUM" align="center">0</h2>
            <br>
            <button onclick="quitSearch()">退出</button>
        </div>`)
    );
    const token = PersonalData.TOKEN;
    socket = io("#");
    socket.emit("queuing", token);

    socket.on("waitedTime", (s) => {
        $("#waitedTime").html(s.TIME);
        $("#QNUM").html(`排隊人數：${s.NUM}`);
    });

    socket.on("disconnect", () => {
        window.location.reload();
    });
    socket.once("CreateGame", (CreationData) => {
        create_2player_game(token, CreationData);
    });
}

function pressLogout(dummy) {
    if (!confirm("登出?")) {
        return;
    }
    PersonalData = {};
    axios.post("#", { PTYPE: "logout" }).then((response) => {
        window.location.reload();
    });
}

function upload(e) {
    var file = e.files[0];
    if (!file) {
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert("檔案太大 不得超過2MB(too large no more than 2MB");
        e.value = "";
        return;
    }

    var reader = new FileReader();
    var fileByteArray = [];
    reader.readAsArrayBuffer(file);
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) {
            var arrayBuffer = evt.target.result,
                array = new Uint8Array(arrayBuffer);
            for (var i = 0; i < array.length; i++) {
                fileByteArray.push(array[i]);
            }
            axios.post("/", { PTYPE: "ChangePIC", UID: PersonalData.UID, file: fileByteArray }).then((response) => {
                if (response.data) {
                    window.location.reload();
                } else {
                    alert("頭像上傳失敗(IMG-upload failed)");
                }
            });
        }
    };
}
function ChangeName() {
    let newName = $("#inputName").val();
    axios.post("/", { PTYPE: "ChangeName", UID: PersonalData.UID, newName: newName }).then((response) => {
        if (response.data) {
            window.location.reload();
        } else {
            alert("名字更改失敗(Name-change failed)");
        }
    });
}

function ChangePW() {
    let newPW = $("#inputPW").val();
    let confirmPW = $("#CONFIRMinputPW").val();
    if (newPW == confirmPW) {
        axios.post("/", { PTYPE: "ChangePW", UID: PersonalData.UID, newPW: newPW }).then((response) => {
            if (response.data) {
                window.location.reload();
            } else {
                alert("密碼更改失敗(Password-change failed)");
            }
        });
    } else {
        alert("密碼不一致！請重新修改");
        $("#inputPW").val("");
        $("#CONFIRMinputPW").val("");
    }
}

function quitSearch() {
    window.location.reload();
}
