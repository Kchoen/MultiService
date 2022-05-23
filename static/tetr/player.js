class PseudoPlayer {
    constructor(player) {
        this.pos = {
            x: player.pos.x,
            y: player.pos.y,
        };
        this.current = player.current;
        this.matrix = player.matrix;
    }

    collide() {
        const [m, o] = [this.current.matrix(), this.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (this.matrix[y + o.y] && this.matrix[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    get_drop_position() {
        while (!this.collide()) {
            this.pos.y++;
        }
        return this.pos.y - 1;
    }
}

function mergeInto(matrix, chunk, pos, id = null) {
    if (id == null) {
        for (let y = chunk.length - 1; y >= 0; --y) {
            for (let x = 0; x < chunk[y].length; ++x) {
                if (chunk[y][x] !== 0) {
                    matrix[y + pos.y][x + pos.x] = chunk[y][x];
                }
            }
        }
    } else {
        for (let y = chunk.length - 1; y >= 0; --y) {
            for (let x = 0; x < chunk[y].length; ++x) {
                if (chunk[y][x] !== 0) {
                    matrix[y + pos.y][x + pos.x] = id;
                }
            }
        }
    }
}

class Player {
    constructor(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        this.matrix = matrix;

        this.remainTime = 0;
        this.dropCounter = 0;
        this.dropInterval = DROP_SLOW;

        this.pos = { x: 0, y: 5 };
        this.current = null;
        this.shifted = false;
        this.holding = null;
        this.next = [];
        for (var i = 0; i < 5; i++) {
            this.next.push(takeRandomChunk());
        }

        this.leftOn = false;
        this.rightOn = false;
        this.upOn = false;
        this.downOn = false;
        this.zOn = false;
        this.horiCounter = 0;
        this.rotateCounter = 0;

        this.combo = 0;

        this.playerDatas = [];

        this.accumulated_lines = 0;
        this.get_next_chunk();
    }

    get_playerData() {
        var output = this.playerDatas;
        this.playerDatas = [];
        return output;
    }

    appendMerge1(last_matrix, removedLines, sendLineNum, numDefense) {
        var data = {};
        data["matrix"] = last_matrix;
        data["next"] = this.next.slice(0);
        data["holding"] = this.holding;
        if (removedLines.length) {
            data["removedLines"] = removedLines;
            data["LINES"] = sendLineNum;
            data["numDefense"] = numDefense;
        }
        this.playerDatas.push(data);
    }

    appendMove() {
        var matrix = deepcopy_2DArray(this.matrix);
        var p = new PseudoPlayer(this);
        var pos = {
            x: this.pos.x,
            y: p.get_drop_position(),
        };
        const m = this.current.matrix();
        mergeInto(matrix, m, pos, BLOCK.PREVIEW);
        mergeInto(matrix, m, this.pos);

        var data = {};
        data["matrix"] = matrix;
        data["next"] = this.next.slice(0);
        data["holding"] = this.holding;

        this.playerDatas.push(data);
    }

    appendKO() {
        var data = {};
        data["matrix"] = deepcopy_2DArray(this.matrix);
        data["next"] = this.next.slice(0);
        data["holding"] = this.holding;
        data["KO"] = true;
        this.playerDatas.push(data);
    }

    appendMerge() {
        this.playerDatas.push({ MERGE: true });
    }

    appendSuicide() {
        this.playerDatas.push({ suicide: true });
    }

    collide() {
        const [m, o] = [this.current.matrix(), this.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (this.matrix[y + o.y] && this.matrix[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge() {
        var last_matrix = this.matrix;
        var removedLines = [];

        /* put chunk first */
        const m = this.current.matrix();
        this.current = null;
        mergeInto(this.matrix, m, this.pos);

        /* remove bomb */
        outer1: for (let y = m.length - 1; y >= 0; --y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] != 0) {
                    var next_line = this.matrix[y + this.pos.y + 1];
                    while (next_line && next_line[x + this.pos.x] == -2) {
                        removedLines.push(y + this.pos.y + 1);
                        if (last_matrix == this.matrix) last_matrix = deepcopy_2DArray(this.matrix);

                        const row = this.matrix.splice(y + this.pos.y + 1, 1)[0].fill(0);
                        this.matrix.unshift(row);
                        this.pos.y++;
                        next_line = this.matrix[y + this.pos.y + 1];
                    }
                    if (removedLines.length) {
                        break outer1;
                    }
                }
            }
        }

        /* sweep */
        let rmLineNum = 0;
        outer: for (let y = this.matrix.length - 1; y > 0; --y) {
            for (let x = 0; x < this.matrix[y].length; ++x) {
                if (this.matrix[y][x] <= 0) {
                    continue outer;
                }
            }

            removedLines.push(y - removedLines.length);
            if (last_matrix == this.matrix) last_matrix = deepcopy_2DArray(this.matrix);

            const row = this.matrix.splice(y, 1)[0].fill(0);
            this.matrix.unshift(row);
            ++y;
            ++rmLineNum;
        }

        /* compute number of send lines */
        var sendLineNum = 0;
        if (removedLines.length) {
            if (rmLineNum == 2) sendLineNum += 1;
            else if (rmLineNum == 3) sendLineNum += 2;
            else if (rmLineNum == 4) sendLineNum += 4;

            if (this.combo == 0) sendLineNum += 0;
            else if (this.combo <= 2) sendLineNum += 1;
            else if (this.combo <= 4) sendLineNum += 2;
            else if (this.combo <= 6) sendLineNum += 3;
            else sendLineNum += 4;
            this.combo++;
        } else {
            this.combo = 0;
        }

        if (this.accumulated_lines + sendLineNum <= 0) {
            this.appendMerge1(last_matrix, removedLines, sendLineNum, sendLineNum);
        } else {
            this.appendMerge1(last_matrix, removedLines, sendLineNum, -this.accumulated_lines);
        }

        this.accumulated_lines += sendLineNum;

        var before_KO = deepcopy_2DArray(this.matrix);
        if (this.accumulated_lines < 0) {
            var l = -this.accumulated_lines;
            this.accumulated_lines = 0;
            var num_bomb = 1;
            for (var i = 0; i < l; i++) {
                const row = this.matrix.splice(0, 1)[0].fill(-1);
                let nb = 0;
                while (nb < num_bomb) {
                    let idx = (20 * Math.random()) | 0;
                    if (row[idx] == -1) {
                        row[idx] = -2;
                        nb++;
                    }
                }
                this.matrix.push(row);
            }
        } else {
            this.accumulated_lines = 0;
        }

        /* handleKO */
        const m1 = this.matrix;
        outer: for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 10; ++x) {
                if (m1[y][x] !== 0) {
                    this.appendKO();
                    this.matrix.forEach((row) => row.fill(0));
                    if (before_KO != null) {
                        let i = this.matrix.length - 1;
                        let h = this.matrix.length - 1;
                        for (; i >= 0; i--) {
                            if (before_KO[i][0] >= 0) {
                                this.matrix[h] = before_KO[i];
                                h--;
                            }
                        }
                    }
                    break outer;
                }
            }
        }

        this.get_next_chunk();
        this.appendMerge();
    }

    downdrop(deltaTime) {
        this.pos.y++;
        var collide = this.collide();
        this.pos.y--;
        if (collide) {
            if (this.remainMultiplier < 1) {
                this.remainMultiplier = 1;
            }
            if (this.downOn) {
                this.remainTime += this.remainMultiplier * 2 * deltaTime;
            } else {
                this.remainTime += this.remainMultiplier * deltaTime;
            }
            if (this.remainTime > MERGE_REMAIN_DURATION) {
                this.merge();
                this.remainTime = 0;
            }
            return;
        }

        this.dropCounter += deltaTime;
        var times = (this.dropCounter / this.dropInterval) | 0;
        this.dropCounter = this.dropCounter % this.dropInterval;
        for (let i = 0; i < times; i++) {
            this.pos.y++;
            if (!this.collide()) {
                this.appendMove();
                continue;
            }
            this.pos.y--;
            return;
        }
    }

    spacedrop() {
        this.pos.y++;
        while (!this.collide()) {
            this.pos.y++;
        }
        this.pos.y--;

        this.merge();
        this.remainTime = 0;
        this.dropCounter = 0;
    }

    move(dir) {
        this.pos.x += dir;
        this.horiCounter = 0;
        if (this.collide()) {
            this.pos.x -= dir;
        } else {
            this.appendMove();
        }
    }

    spawn() {
        this.pos.y = 5;
        this.pos.x = ((this.matrix[0].length / 2) | 0) - ((this.current.shape[0] / 2) | 0) - 1;
        while (this.collide() && this.pos.y >= -1) {
            this.pos.y--;
        }
        if (this.pos.y < 0) {
            this.appendSuicide();
            return;
        }
        this.appendMove();
    }

    get_next_chunk() {
        this.current = createPieceFromInt(this.next[0]);
        this.next[0] = this.next[1];
        this.next[1] = this.next[2];
        this.next[2] = this.next[3];
        this.next[3] = this.next[4];
        this.next[4] = takeRandomChunk();
        this.spawn();
        this.shifted = false;
        this.remainMultiplier = 0;
        this.remainTime = 0;
        this.dropCounter = 0;
    }

    hold() {
        if (this.shifted) return;
        this.shifted = true;
        if (this.holding == null) {
            this.holding = this.current.index;
            this.get_next_chunk();
            this.shifted = true;
        } else {
            [this.holding, this.current] = [this.current.index, createPieceFromInt(this.holding)];
            this.spawn();
        }
    }

    rotate(dir) {
        this.current.rotate(this, dir);
        this.rotateCounter = 0;
        this.remainTime = 0;
        this.remainMultiplier *= 1.2;
        this.appendMove();
    }

    update(deltaTime) {
        if (this.current == null) return;
        if (this.leftOn || this.rightOn) {
            this.horiCounter += deltaTime;
            if (this.horiCounter > HORI_INTERVAL) {
                if (this.leftOn) {
                    this.move(-1);
                } else {
                    this.move(1);
                }
            }
        }
        if (this.upOn || this.zOn) {
            this.rotateCounter += deltaTime;
            if (this.rotateCounter > SHURIKEN_INTERVAL) {
                if (this.upOn) {
                    this.rotate(1);
                } else {
                    this.rotate(-1);
                }
            }
        }
        this.downdrop(deltaTime);
    }
}
