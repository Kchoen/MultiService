JLSTZ_WALL_KICK_OFFSET = [
    [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ],
    [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
    ],
    [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ],
    [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
    ],
];

I_WALL_KICK_OFFSET = [
    [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 0],
        [2, 0],
    ],
    [
        [-1, 0],
        [0, 0],
        [0, 0],
        [0, 1],
        [0, -2],
    ],
    [
        [-1, 1],
        [1, 1],
        [-2, 1],
        [1, 0],
        [-2, 0],
    ],
    [
        [0, 1],
        [0, 1],
        [0, 1],
        [0, -1],
        [0, 2],
    ],
];

class chunkBase {
    constructor(index, shape) {
        this.rot90 = 0;
        this.index = index;
        this.shape = shape;
    }
    rotate(player, dir) {
        if (this.index == 2) return;

        const OFFSET = this.index == 5 ? I_WALL_KICK_OFFSET : JLSTZ_WALL_KICK_OFFSET;
        const offset_0 = OFFSET[this.rot90];
        this.rot90 = (this.rot90 + 4 + dir) % 4;
        const offset_1 = OFFSET[this.rot90];

        const ori_pos = {
            x: player.pos.x,
            y: player.pos.y,
        };

        for (var i = 0; i < 5; i++) {
            player.pos.x = ori_pos.x + (offset_0[i][0] - offset_1[i][0]);
            player.pos.y = ori_pos.y - (offset_0[i][1] - offset_1[i][1]);
            if (!player.collide()) return;
        }
        player.pos = ori_pos;
        this.rot90 = (this.rot90 + 4 - dir) % 4;
    }
}

class chunkT extends chunkBase {
    constructor() {
        super(1, (3, 3));
    }

    matrix() {
        switch (this.rot90) {
            case 0:
                return [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0],
                ];
            case 1:
                return [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 1, 0],
                ];
            case 2:
                return [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0],
                ];
            case 3:
                return [
                    [0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 0],
                ];
        }
    }
}

class chunkSqueare extends chunkBase {
    constructor() {
        super(2, (2, 2));
    }
    matrix() {
        return [
            [2, 2],
            [2, 2],
        ];
    }
}
class chunkBlueJ extends chunkBase {
    constructor() {
        super(3, (3, 3));
    }

    matrix() {
        switch (this.rot90) {
            case 0:
                return [
                    [0, 0, 3],
                    [3, 3, 3],
                    [0, 0, 0],
                ];
            case 1:
                return [
                    [0, 3, 0],
                    [0, 3, 0],
                    [0, 3, 3],
                ];
            case 2:
                return [
                    [0, 0, 0],
                    [3, 3, 3],
                    [3, 0, 0],
                ];
            case 3:
                return [
                    [3, 3, 0],
                    [0, 3, 0],
                    [0, 3, 0],
                ];
        }
    }
}

class chunkOrangeL extends chunkBase {
    constructor() {
        super(4, (3, 3));
    }
    matrix() {
        switch (this.rot90) {
            case 0:
                return [
                    [4, 0, 0],
                    [4, 4, 4],
                    [0, 0, 0],
                ];
            case 1:
                return [
                    [0, 4, 4],
                    [0, 4, 0],
                    [0, 4, 0],
                ];
            case 2:
                return [
                    [0, 0, 0],
                    [4, 4, 4],
                    [0, 0, 4],
                ];
            case 3:
                return [
                    [0, 4, 0],
                    [0, 4, 0],
                    [4, 4, 0],
                ];
        }
    }
}

class chunkBar extends chunkBase {
    constructor() {
        super(5, (4, 4));
    }
    matrix() {
        switch (this.rot90) {
            case 0:
                return [
                    [0, 0, 0, 0],
                    [5, 5, 5, 5],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ];
            case 1:
                return [
                    [0, 0, 5, 0],
                    [0, 0, 5, 0],
                    [0, 0, 5, 0],
                    [0, 0, 5, 0],
                ];
            case 2:
                return [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [5, 5, 5, 5],
                    [0, 0, 0, 0],
                ];
            case 3:
                return [
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                ];
        }
    }
}

class chunkGreenS extends chunkBase {
    constructor() {
        super(6, (3, 3));
    }
    matrix() {
        switch (this.rot90) {
            case 0:
                return [
                    [0, 6, 6],
                    [6, 6, 0],
                    [0, 0, 0],
                ];
            case 1:
                return [
                    [0, 6, 0],
                    [0, 6, 6],
                    [0, 0, 6],
                ];
            case 2:
                return [
                    [0, 0, 0],
                    [0, 6, 6],
                    [6, 6, 0],
                ];
            case 3:
                return [
                    [6, 0, 0],
                    [6, 6, 0],
                    [0, 6, 0],
                ];
        }
    }
}
class chunkRedZ extends chunkBase {
    constructor() {
        super(7, (3, 3));
    }
    matrix() {
        switch (this.rot90) {
            case 0:
                return [
                    [7, 7, 0],
                    [0, 7, 7],
                    [0, 0, 0],
                ];
            case 1:
                return [
                    [0, 0, 7],
                    [0, 7, 7],
                    [0, 7, 0],
                ];
            case 2:
                return [
                    [0, 0, 0],
                    [7, 7, 0],
                    [0, 7, 7],
                ];
            case 3:
                return [
                    [0, 7, 0],
                    [7, 7, 0],
                    [7, 0, 0],
                ];
        }
    }
}
