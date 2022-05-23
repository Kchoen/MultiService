function createPieceFromInt(type) {
    return new PIECES[type]();
}

function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex > 1) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function takeRandomChunk() {
    let chunk = takeRandomChunk.blockList[takeRandomChunk.curBlock];
    takeRandomChunk.curBlock++;
    if (takeRandomChunk.curBlock == 7) {
        takeRandomChunk.blockList = shuffle([1, 2, 3, 4, 5, 6, 7]);
        takeRandomChunk.curBlock = 0;
    }
    return chunk;
}
takeRandomChunk.curBlock = 0;
takeRandomChunk.blockList = shuffle([1, 2, 3, 4, 5, 6, 7]);

function deepcopy_2DArray(source) {
    output = [];
    for (var i = 0; i < source.length; i++) {
        output.push(source[i].slice(0));
    }
    return output;
}

function create_player(style, P) {
    var binaryData = [];
    binaryData.push(P.img);
    objurl = window.URL.createObjectURL(new Blob(binaryData, { type: "application/zip" }));
    return $(`
        <div class="player" style="${style}">
            <img class="Icon" src="${objurl}" width="80" height="80" />
            <div class="Name" align="left">${P.name} ${P.elo != null ? "<br>" + (P.elo | 0) : ""} </div>
            <div class="border-word-hold">Hold</div>
            <div class="border-word-next">Next</div>
            <div class="border-word-KO">K.O.</div>
            <div class="border-word-SentLines" align="center">Sent<br />Lines</div>
            <div class="KO">0</div>
            <div class="Sent">0</div>
            <canvas class="tetr" width="200" height="410"></canvas>
            <canvas class="holder" width="80" height="80"></canvas>
            <canvas class="next-1" width="80" height="80"></canvas>
            <canvas class="next-2" width="80" height="80"></canvas>
            <canvas class="next-3" width="80" height="80"></canvas>
            <canvas class="next-4" width="80" height="80"></canvas>
            <canvas class="next-5" width="80" height="80"></canvas>
        </div>`);
}

function create_2player_game(token, CreationData) {
    var myself = new Player(10, 25);

    const tetri = [];
    var counter = 0;
    let P1 = CreationData["player1"];
    let P2 = CreationData["player2"];
    var players = [create_player(p1_style, P1).get(0), create_player(p2_style, P2).get(0)];
    var CountDownBlock = $('<div class="CountDown" align="center"></div>');
    var ReturnButton = $(`
        <div class="RETURN" style="top: calc(55vh)">
            <button onclick="Return()">返回(Go back)</button>
        </div>`);
    socket.on("CountDownStart", (data) => {
        CountDownBlock.html(data);
    });
    socket.on("CountDownGame", (data) => {
        CountDownBlock.html(data);
    });

    $(document.body).empty();
    $(document.body).append(get_banner(PersonalData.NAME));
    $(document.body).append($(players[0]));
    $(document.body).append($(players[1]));
    $(document.body).append(CountDownBlock);
    $(document.body).append(ReturnButton);

    var shared = {
        selfKO: players[0].querySelector(".KO"),
        selfSent: players[0].querySelector(".Sent"),
        oppoKO: players[1].querySelector(".KO"),
        oppoSent: players[1].querySelector(".Sent"),
        myself: myself,
    };

    players.forEach((element) => {
        const tetr = new Tetr(shared, element, counter, myself, token, CountDownBlock);
        tetri.push(tetr);
        counter++;
    });

    const keyDownListener = (event) => {
        myself.currentMove = event.keyCode;

        if (event.key == " ") {
            myself.spacedrop();
        } else if (["ArrowLeft"].indexOf(event.key) + 1) {
            if (!myself.leftOn) {
                myself.move(-1);
                myself.horiCounter = HORI_INTERVAL - HORI_INTERVAL_FIRST;
            }
            myself.leftOn = true;
            myself.rightOn = false;
        } else if (["ArrowRight"].indexOf(event.key) + 1) {
            if (!myself.rightOn) {
                myself.move(1);
                myself.horiCounter = HORI_INTERVAL - HORI_INTERVAL_FIRST;
            }
            myself.rightOn = true;
            myself.leftOn = false;
        } else if (["ArrowUp"].indexOf(event.key) + 1) {
            if (!myself.upOn) {
                myself.rotate(1);
                myself.rotateCounter = SHURIKEN_INTERVAL - SHURIKEN_INTERVAL_FIRST;
            }
            myself.upOn = true;
            myself.zOn = false;
        } else if (["z", "Z", "Control"].indexOf(event.key) + 1) {
            if (!myself.zOn) {
                myself.rotate(-1);
                myself.rotateCounter = SHURIKEN_INTERVAL - SHURIKEN_INTERVAL_FIRST;
            }
            myself.zOn = true;
            myself.upOn = false;
        } else if (["c", "C", "Shift"].indexOf(event.key) + 1) {
            myself.hold();
        } else if (["ArrowDown"].indexOf(event.key) + 1) {
            myself.downOn = true;
            if (myself.dropInterval !== DROP_FAST) {
                myself.dropCounter = 0;
                myself.downdrop(0);
                myself.dropInterval = DROP_FAST;
            }
        }
    };

    const keyUpListener = (event) => {
        if (["ArrowLeft"].indexOf(event.key) + 1) {
            myself.leftOn = false;
        } else if (["ArrowRight"].indexOf(event.key) + 1) {
            myself.rightOn = false;
        } else if (["ArrowUp"].indexOf(event.key) + 1) {
            myself.upOn = false;
        } else if (["ArrowDown"].indexOf(event.key) + 1) {
            myself.downOn = false;
            myself.dropInterval = DROP_SLOW;
        } else if (["z", "Z", "Control"].indexOf(event.key) + 1) {
            myself.zOn = false;
        }
    };

    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);
}

function Return() {
    window.location.reload();
}

function render_rankingBoard() {
    let rankCode = `
    <div><table class="rankBoard">
    <tr align="center">
        <th style="width:5vw">排名</th>
        <th style="width:10vw"></th>
        <th style="width:10vw">使用者名稱</th>
        <th style="width:10vw">積分</th>
    </tr>`;
    let appendCode = `
    <tr onclick="loadRank('down')" align="center">
        <td></td>
        <td></td>
        <td>。。。</td>
        <td></td>
    </tr>`;
    let GAP = true;
    for (let i = 0; i < RankData.length; i++) {
        r = RankData[i];
        if (r.rNum != i && GAP) {
            rankCode += getAppendCode("top");
            rankCode += getAppendCode("mid");
            (GAP = false), (abc.a = i), (abc.b = r.rNum);
            abc.c = RankData.length + (r.rNum - i);
        }
        let objurl = window.URL.createObjectURL(new Blob([new Uint8Array(r.img.data)]));
        if (r.PLAYER != undefined) {
            rankCode += `
            <tr align="center">
                <td style="color:yellow">${parseInt(r.rNum) + 1}</td>
                <td><img src="${objurl}" width="48" height="48" /></td>
                <td style="color:yellow">${r.name}</td>
                <td style="color:yellow">${r.elo}</td>
            </tr>`;
            PLAYER = i;
        } else {
            rankCode += `
            <tr align="center">
                <td>${parseInt(r.rNum) + 1}</td>
                <td><img src="${objurl}" width="48" height="48" /></td>
                <td>${r.name}</td>
                <td>${r.elo}</td>
            </tr>`;
        }
    }
    if (GAP) {
        abc.c = RankData.length;
    }
    if (isLast != true) {
        rankCode += getAppendCode("down");
    }
    rankCode += "</table></div>";

    $("#RANK").empty();
    $("#RANK").append(rankCode);
}
function initRank() {
    axios.get("/RANKING").then((msg) => {
        console.log(msg);
        RankData = msg.data.rankList;
        isLast = msg.data.isLast;
        render_rankingBoard();
    });
}
function loadRank(TYPE) {
    let left, right;
    switch (TYPE) {
        case "top":
            left = abc.a;
            right = abc.a + 3;
            abc.a += 3;
            break;
        case "mid":
            left = abc.b - 3;
            right = abc.b;
            abc.b -= 3;
            break;
        case "down":
            left = abc.c;
            right = abc.c + 3;
            abc.c += 3;
            break;
    }
    axios.get(`RANKING?left=${left}&right=${right}`).then((msgs) => {
        rList = msgs.data.rankList;
        console.log(rList);
        isLast = msgs.data.isLast;
        for (r of rList) {
            if (!RankData.includes(r)) RankData.push(r);
        }
        RankData.sort((a, b) => {
            return a.rNum - b.rNum;
        });
        render_rankingBoard();
    });
}
function getAppendCode(type) {
    let appendCode = `
    <tr onclick="loadRank('${type}')" align="center">
        <td></td>
        <td></td>
        <td>。。。</td>
        <td></td>
    </tr>`;
    return appendCode;
}
