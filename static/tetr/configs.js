BLOCK_IMGS = [
    document.getElementById("ghostblock"),
    document.getElementById("purpleblock"),
    document.getElementById("yellowblock"),
    document.getElementById("orangeblock"),
    document.getElementById("blueblock"),
    document.getElementById("lightblueblock"),
    document.getElementById("greenblock"),
    document.getElementById("redblock"),
];

BLANK_IMGS = [document.getElementById("darkgreysquare"), document.getElementById("lightgreysquare")];
SENT_LINE_IMGS = [document.getElementById("rock"), document.getElementById("bomb")];

CHUNK_IMGS = [
    document.getElementById("ghostchunk"),
    document.getElementById("purplechunk"),
    document.getElementById("yellowchunk"),
    document.getElementById("orangechunk"),
    document.getElementById("bluechunk"),
    document.getElementById("lightbluechunk"),
    document.getElementById("greenchunk"),
    document.getElementById("redchunk"),
];

KOIMG = document.getElementById("KOimg");

UPDATE_INTERVAL = 5;
DRAW_INTERVAL = 1;

HORI_INTERVAL_FIRST = 160;
HORI_INTERVAL = 30;
SHURIKEN_INTERVAL_FIRST = 300;
SHURIKEN_INTERVAL = 150;
COMMUNICATION_INTERVAL = 50;

DROP_SLOW = 1000;
DROP_FAST = 60;

FADE_OUT_DURATION = 150;
MERGE_REMAIN_DURATION = 800;
KO_DURATION = 300;

PIECES = [null, chunkT, chunkSqueare, chunkBlueJ, chunkOrangeL, chunkBar, chunkGreenS, chunkRedZ];

BLOCK = {
    BLANK: 0,
    T: 1,
    O: 2,
    J: 3,
    L: 4,
    I: 5,
    S: 6,
    Z: 7,
    PREVIEW: 8,

    BOMB: -2,
    ROCK: -1,
};

const p1height = "calc(85vh)";
const p2height = "calc(85vh)";
const p1width = "calc(85vh * 0.72)";
const p2width = "calc(85vh * 0.72)";
const p1left = "calc(5vw)";
const p2left = "calc(95vw - 95vh * 0.72)";
const p1_style = `top: 12.5vh; left: ${p1left}; font-size: calc(5.36vh); height: ${p1height}; width: ${p1width}`;
const p2_style = `top: 12.5vh; left: ${p2left}; font-size: calc(5.36vh); height: ${p2height}; width: ${p2width}`;

MAX_KO = 5;
