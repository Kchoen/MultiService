function drawInto(context, value, x, y) {
    if (value < 0) {
        context.drawImage(SENT_LINE_IMGS[-value - 1], x, y - 4.5, 1, 1);
    } else if (value == 8) {
        context.fillStyle = "#555";
        context.fillRect(x, y - 4.5, 1, 1);
    } else if (value > 0) {
        context.drawImage(BLOCK_IMGS[value], x, y - 4.5, 1, 1);
    } else {
        context.drawImage(BLANK_IMGS[(x + y) % 2], x, y - 4.5, 1, 1);
    }
}

class Tetr {
    constructor(shared, element, index, myself, token, CountDownBlock) {
        this.token = token;
        this.index = index;
        this.element = element;
        this.shared = shared;
        this.canvas = element.querySelector(".tetr");
        this.context = this.canvas.getContext("2d");
        this.context.scale(20, 20);

        this.holder = element.querySelector(".holder");
        this.holder_context = this.holder.getContext("2d");
        this.holder_context.scale(80, 80);

        this.next = element.querySelectorAll('[class^="next-"]');
        this.next_context = [];
        for (var i = 0; i < this.next.length; i++) {
            this.next_context.push(this.next[i].getContext("2d"));
            this.next_context[i].scale(80, 80);
        }

        this.draw_queue_end = this.draw_queue_start = { next_view: null };
        this.myself = myself;

        this.defense = element.querySelector(".defense");

        this.isEnd = false;
        socket.once("GameOver", () => {
            this.isEnd = true;
            data = {
                myLine: this.accuSent,
                oppoKO: this.accuKO,
            };
            socket.emit("Result", data);
        });
        socket.once("Result", (string) => {
            if (string.length > 12) {
                CountDownBlock.css({ "font-size": "20px" });
            }
            CountDownBlock.html(string);
        });

        socket.once("StartGame", () => {
            if (index == 0) {
                this.draw_queue_start;
                this.launch_self();
            } else {
                this.launch_opponent();
            }
            this.accuSent = 0;
            this.accuKO = 0;

            this.launch_drawer();
        });
    }

    launch_self() {
        let lastTime = new Date().getTime();

        const update = () => {
            setTimeout(update, UPDATE_INTERVAL);
            if (this.isEnd) return;
            let currentTime = new Date().getTime();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.myself.update(deltaTime);

            var d = this.myself.get_playerData();
            for (let i = 0; i < d.length; i++) {
                var data = d[i];
                if (data.suicide) {
                    socket.emit("suicide");
                    return;
                }
                data.ID = this.token;
                socket.emit("playerData", data);
                if (data.MERGE) continue;
                this.draw_queue_end.next_view = data;
                this.draw_queue_end = data;
                if (data["LINES"]) {
                    this.accuSent += data["LINES"];
                    this.shared.selfSent.innerHTML = this.accuSent;
                    this.setDefense(data["numDefense"]);
                    this.setAttack(data["LINES"] - data["numDefense"]);
                }
                if (data.KO) {
                    this.accuKO++;
                    this.shared.oppoKO.innerHTML = this.accuKO;
                    if (this.accuKO >= MAX_KO) {
                        socket.emit("suicide");
                        return;
                    }
                }
            }
        };
        update();
    }

    launch_opponent() {
        socket.on("playerData", (data) => {
            if (data.MERGE) {
                if (this.shared.myself.accumulated_lines > 0) {
                    this.shared.myself.accumulated_lines = 0;
                }
                return;
            }
            if (data["LINES"]) {
                this.accuSent += data["LINES"];
                this.shared.oppoSent.innerHTML = this.accuSent;
                this.shared.myself.accumulated_lines -= data["LINES"];
                this.setDefense(data["numDefense"]);
                this.setAttack(data["LINES"] - data["numDefense"]);
            }
            if (data.KO) {
                this.accuKO++;
                this.shared.selfKO.innerHTML = this.accuKO;
            }
            this.draw_queue_end.next_view = data;
            this.draw_queue_end = data;
        });
    }

    launch_drawer() {
        var canvasCache = {};
        const update = () => {
            var current = this.draw_queue_start.next_view;
            if (current == null) {
                setTimeout(update, 1);
                return;
            }

            this.draw_queue_start = current;
            if (current.removedLines != null) {
                var start_time = new Date().getTime();
                const draw_animation = () => {
                    var t = new Date().getTime() - start_time;
                    if (t < FADE_OUT_DURATION) {
                        this.drawAnimation(current, (FADE_OUT_DURATION - t) / FADE_OUT_DURATION);
                        canvasCache = {};
                        setTimeout(draw_animation, 1);
                    } else {
                        update();
                    }
                };
                draw_animation();
                return;
            }

            this.draw(current, canvasCache);
            canvasCache = current;

            if (current.KO) {
                canvasCache = {};
                let a = this.canvas.getContext("2d");
                a.scale(10, 10);
                a.drawImage(KOIMG, 0, 0.2, 1, 1);
                a.scale(0.1, 0.1);
                setTimeout(update, KO_DURATION);
            } else update();
        };
        update();
    }

    drawAnimation(player, alpha) {
        for (var i = 0; i < 5; i++) {
            this.next_context[i].drawImage(CHUNK_IMGS[player.next[i]], 0, 0, 1, 1);
        }
        if (player.holding != null) {
            this.holder_context.drawImage(CHUNK_IMGS[player.holding], 0, 0, 1, 1);
        }

        if (alpha > 0.2) {
            alpha = (alpha - 0.2) / (1 - 0.2);
            this.drawAlphaMatrix(player.matrix, player.removedLines, alpha);
        } else {
            alpha = alpha / 0.2;
            this.drawDropMatrix(player.matrix, player.removedLines, alpha);
        }
    }

    draw(player, canvasCache) {
        for (var i = 0; i < 5; i++) {
            this.next_context[i].drawImage(CHUNK_IMGS[player.next[i]], 0, 0, 1, 1);
        }
        if (player.holding != null) {
            this.holder_context.drawImage(CHUNK_IMGS[player.holding], 0, 0, 1, 1);
        }
        this.context.globalAlpha = 1;
        this.drawMatrix(player.matrix, canvasCache.matrix);
    }

    drawMatrix(matrix, matrix_cache) {
        if (matrix_cache == null) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    drawInto(this.context, value, x, y);
                });
            });
            return;
        }
        for (var y = 0; y < matrix.length; y++) {
            const row = matrix[y];
            const row_cache = matrix_cache[y];
            for (var x = 0; x < row.length; x++) {
                const value = row[x];
                const value_cache = row_cache[x];
                if (value == value_cache) continue;
                drawInto(this.context, value, x, y);
            }
        }
    }

    drawAlphaMatrix(matrix, removedLines, alpha) {
        var tmp = this.context.globalAlpha;
        for (var y = 0; y < matrix.length; y++) {
            const row = matrix[y];
            for (var x = 0; x < row.length; x++) {
                const value = matrix[y][x];
                if (removedLines.includes(y)) {
                    this.context.globalAlpha = 1;
                    this.context.drawImage(BLANK_IMGS[(x + y) % 2], x, y - 4.5, 1, 1);

                    this.context.globalAlpha = alpha;
                    if (value < 0) {
                        this.context.drawImage(SENT_LINE_IMGS[-value - 1], x, y - 4.5, 1, 1);
                    } else if (value > 0) {
                        this.context.drawImage(BLOCK_IMGS[value], x, y - 4.5, 1, 1);
                    }
                } else {
                    drawInto(this.context, value, x, y);
                }
            }
        }
        this.context.globalAlpha = tmp;
    }

    drawDropMatrix(matrix, removedLines, alpha) {
        for (let y = matrix.length - 1; y >= 0; y--) {
            for (let x = 0; x < matrix[y].length; x++) {
                this.context.drawImage(BLANK_IMGS[(x + y) % 2], x, y - 4.5, 1, 1);
            }
        }
        let h = matrix.length - 1;
        for (let y = matrix.length - 1; y >= 0; y--) {
            const row = matrix[y];
            if (removedLines.includes(y)) {
                h -= alpha;
            } else {
                for (let x = 0; x < row.length; x++) {
                    const value = row[x];
                    if (value < 0) {
                        this.context.drawImage(SENT_LINE_IMGS[-value - 1], x, h - 4.5, 1, 1);
                    } else if (value > 0) {
                        this.context.drawImage(BLOCK_IMGS[value], x, h - 4.5, 1, 1);
                    }
                }
                h--;
            }
        }
    }

    setDefense(N) {
        var ftop = 50;
        var fleft = 50;
        var ttop = 65;
        var tleft = 79;

        const update = (n) => {
            if (n <= 0) return;
            setTimeout(function () {
                update(n - 1);
            }, COMMUNICATION_INTERVAL);

            var d = $('<div class="defense"></div>');
            $(this.element).append(d);
            d.animate(
                { transform: "1" },
                {
                    duration: 250,
                    step: function (now, fx) {
                        if (fx.prop != "transform") return;
                        d.css({
                            top: "calc(" + (ftop + now * (ttop - ftop)) + "%)",
                            left: "calc(" + (fleft + now * (tleft - fleft)) + "%)",
                            width: "32px",
                            height: "32px",
                        });
                    },
                    complete: function () {
                        d.remove();
                    },
                }
            );
        };
        update(N);
    }

    setAttack(N) {
        var ftop = 30;
        var ttop = 50;

        if (this.index == 0) {
            var fleft = "(" + p1left + " + " + p1width + " * 0.5 - 12px)";
            var tleft = "(" + p2left + " + " + p2width + " * 0.79)";
        } else {
            var fleft = "(" + p2left + " + " + p2width + " * 0.5 - 12px)";
            var tleft = "(" + p1left + " + " + p1width + " * 0.79)";
        }

        const update = (n) => {
            if (n <= 0) return;
            setTimeout(function () {
                update(n - 1);
            }, COMMUNICATION_INTERVAL);

            var d = $('<div class="attack"></div>');
            $(this.element).append(d);
            d.animate(
                { transform: "1" },
                {
                    duration: 250,
                    step: function (now, fx) {
                        if (fx.prop != "transform") return;
                        d.css({
                            top: "calc(" + (ftop + now * (ttop - ftop) - (1 - now) * now * 60) + "vh )",
                            left: "calc(" + (" " + (1 - now) + " * " + fleft + " + " + now + "*" + tleft) + " )",
                            width: "32px",
                            height: "32px",
                        });
                    },
                    complete: function () {
                        d.remove();
                    },
                }
            );
        };
        update(N);
    }
}
