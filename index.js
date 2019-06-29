var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/game.html');
});

app.get('/css/style.css', function(req, res) {
    res.sendFile(__dirname + '/css/style.css');
});

app.get('/js/canv.js', function(req, res) {
    res.sendFile(__dirname + '/js/canv.js');
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});

var field_height = 2000; //y
var field_width = 2000; //x
var border_max_value = 15; //МАКС количесвто препядствий
var border_max_lenght = 10; //Их МАКС мак длина
var food_max = 50;

var food_value = Math.floor(Math.random() * (food_max - 5) + 5);
var border_value = Math.floor(Math.random() * (border_max_value - 5) + 5); //Количество препядствий ИНИЦИАЛИЗАЦИЯ
var border_lenght; //Длина конкретного борта
var border = [];
var food = [];

function isInteger(num) {
    return (num ^ 0) === num;
}

function getRandomArbitrary(min, max) {
    var norm = Math.floor(Math.random() * (max - min) + min);
    if (isInteger(norm / 20)) return norm;
    else return getRandomArbitrary(min, max);
}

var arr_sq = [];

function clear_space() {
    try {
        for (var ind = 0; ind <= field_height; ind += 20) {
            for (var inde = 0; inde <= field_width; inde += 20) {
                if ((ind == 0) || (inde == 0) || (ind == field_height - 20) || (inde == field_width - 20)) {
                    arr_sq[ind.toString() + "_" + inde.toString()] = {
                        id: ind.toString() + "_" + inde.toString(),
                        x: ind,
                        y: inde,
                        busy_id: "-1",
                        food: false,
                        border: true,
                    };

                } else {
                    arr_sq[ind.toString() + "_" + inde.toString()] = {
                        id: ind.toString() + "_" + inde.toString(),
                        x: ind,
                        y: inde,
                        busy_id: "-1",
                        food: false,
                        border: false,
                    }

                }
            }
        }

        arr_sq["2000_2000"] = {
            field_height: field_height,
            field_width: field_width
        };
        console.log(arr_sq["0_0"]);
        console.log("Ячейки успешно инициализированы");
    } catch (e) {
        console.log(e);
    }

}

function border_add() {
    try {
        border_lenght = Math.floor(Math.random() * (border_max_lenght - 5) + 5); //Длина
        border[0] = {
            x: getRandomArbitrary(0, field_height - border_max_lenght),
            y: getRandomArbitrary(0, field_width - border_max_lenght),
        };
        for (let ind = 1; ind <= border_lenght; ind++) {
            border[ind] = {
                x: border[ind - 1].x + 20,
                y: border[0].y,
            };

        }

        for (let ind = 0; ind <= border_lenght; ind++) {
            if (arr_sq[border[ind].x + "_" + border[ind].y].border == false)
                arr_sq[border[ind].x + "_" + border[ind].y].border = true;
        }
        //
        console.log(border);
    } catch (e) {
        console.log("Промах с конкретным бортом");
        border_add();
    }

}

function food_add() {
    try {
        var x = getRandomArbitrary(0, field_height - 550);
        var y = getRandomArbitrary(0, field_width - 550);
        if (arr_sq[x + "_" + y].border == false) {
            arr_sq[x + "_" + y].food = true;
        } else food_add();
        console.log(arr_sq[x + "_" + y].food);
        return x + "_" + y;
    } catch (e) {
        console.log(e);
        food_add();
    }
}

function food_init() {
    try {
        for (let ind = 0; ind <= food_value; ind++) {
            var x = getRandomArbitrary(0, field_height - 400);
            var y = getRandomArbitrary(0, field_width - 400);
            if (arr_sq[x + "_" + y].border == false)
                arr_sq[x + "_" + y].food = true;
            else food_add();
        }
        console.log(arr_sq[x + "_" + y].food);
    } catch (e) {
        console.log(e);
    }

}

function border_init() {
    try {
        for (let i = 0; i < border_value; i++) {
            border_add();
        }
    } catch (e) {
        border_add();
        console.log("Промахнулся с границей");
    }

}

//Инициализация
clear_space(); //Расчерчиваем
border_init(); //Добавляем борты
food_init(); //Раскладываем еду

var player = [];

io.on('connection', function(socket) {
    var player_num = 0;
    try {
        console.log('Установлено новое подключние!');
        console.log("ID= " + socket.id);

        socket.on('player_num_req', function(msg) {
            try {
                console.log("Пользователь запросил ID");
                io.emit('player_num_ans', socket.id);
                player_num++;
                console.log("Количествео игроков: " + player_num);
            } catch (e) {
                io.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });

        socket.on('add_user', function(msg) {
            try {
                player[msg.id] = msg;
                console.log(player[msg.id]);
                console.log("Добавлен новый пользователь ID=" + msg.id);
                io.emit('send border', arr_sq["2000_2000"]);

                for (let ind = 0; ind < field_height; ind += 20) {
                    for (let inde = 0; inde < field_width; inde += 20) {

                        if (arr_sq[ind + "_" + inde].border == true) {
                            io.emit('draw', { fillStyle: '#FF0000', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                        if (arr_sq[ind + "_" + inde].food == true) {
                            io.emit('draw', { fillStyle: '#00FF00', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                        if (arr_sq[ind + "_" + inde].busy_id !== "-1") {
                            io.emit('draw', { fillStyle: '#FFFF00', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                    }

                }
                console.log("Поле игрока очищено");
                went(msg.id);
            } catch (e) {
                io.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });

        socket.on('login', function(ans) {
            if (ans.pass == 222)
                player[ans.id].admin = true;
        });

        socket.on("windowResized", function() {
            try {
                socket.emit('send border', arr_sq["2000_2000"]);
                for (let ind = 0; ind < field_height; ind += 20) {
                    for (let inde = 0; inde < field_width; inde += 20) {

                        if (arr_sq[ind + "_" + inde].border == true) {
                            io.emit('draw', { fillStyle: '#FF0000', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                        if (arr_sq[ind + "_" + inde].food == true) {
                            io.emit('draw', { fillStyle: '#00FF00', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                        if (arr_sq[ind + "_" + inde].busy_id !== "-1") {
                            io.emit('draw', { fillStyle: '#FFFF00', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                    }

                }
            } catch (e) {
                console.log(e);
            }

        })
        socket.on('player_click', function(ans) {
            try {
                console.log("ID [" + ans.id + "] кликнул X=" + ans.x + " Y=" + ans.y);
                if (player[ans.id].admin == true) {
                    arr_sq[ans.x + "_" + ans.y].border = true;
                    io.emit('draw', {
                        id: ans.x,
                        x: ans.x,
                        y: ans.y,
                        fillStyle: "red"
                    });
                }
            } catch (e) {
                socket.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });
        socket.on('player_rghtclick', function(ans) {
            try {
                if (player[ans.id].admin == true) {
                    console.log("ID [" + ans.id + "] кликнул X=" + ans.x + " Y=" + ans.y);
                    player[ans.id].x = ans.x;
                    player[ans.id].y = ans.y;
                }
            } catch (e) {
                socket.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });
        socket.on('color_change', function(ans) {
            try {
                console.log("ID [" + ans.id + "] сменил сцвет " + ans.color);
                player[ans.id].color_body = ans.color;
            } catch (e) {
                io.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });

        socket.on('player_eraser', function(ans) {
            try {
                if (player[ans.id].admin == true) {
                    console.log("[ " + ans.id + " ] Стер X=" + ans.x + " Y=" + ans.y);
                    arr_sq[ans.x + "_" + ans.y].border = false;
                    io.emit('eraser', {
                        id: ans.id,
                        x: ans.x,
                        y: ans.y,
                    });
                }
            } catch (e) {
                socket.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });

        socket.on('clear', function(ans) {
            try {
                io.emit('send border', arr_sq["2000_2000"]);

                for (let ind = 0; ind <= field_height; ind += 20) {
                    for (let inde = 0; inde <= field_width; inde += 20) {

                        if (arr_sq[ind + "_" + inde].border == true) {
                            io.emit('draw', { fillStyle: '#FF0000', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                        if (arr_sq[ind + "_" + inde].food == true) {
                            io.emit('draw', { fillStyle: '#00FF00', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                        if (arr_sq[ind + "_" + inde].busy_id !== "-1") {
                            io.emit('draw', { fillStyle: '#FFFF00', x: arr_sq[ind + "_" + inde].x, y: arr_sq[ind + "_" + inde].y });
                        }

                    }

                }
                console.log("Поле очищено");
            } catch (e) {
                console.log(e);
            }

        });

        socket.on('key_press', function(keyp) {
            try {
                console.log("ID [" + keyp.id + "] нажал клавишу " + keyp.par);
                if ((player[keyp.id].side !== "top") && (player[keyp.id].side !== "down")) {
                    if ((keyp.par == 87) || (keyp.par == 38)) {
                        player[keyp.id].side = "top";
                        went(keyp.id);
                    }
                    if ((keyp.par == 83) || (keyp.par == 40)) {
                        player[keyp.id].side = "down";
                        went(keyp.id);
                    }
                }
                if ((player[keyp.id].side !== "left") && (player[keyp.id].side !== "right")) {
                    if ((keyp.par == 65) || (keyp.par == 37)) {
                        player[keyp.id].side = "left";
                        went(keyp.id);
                    }
                    if ((keyp.par == 68) || (keyp.par == 39)) {
                        player[keyp.id].side = "right";
                        went(keyp.id);
                    }
                }
                if (keyp.par == 70) {
                    if (player[keyp.id].admin == true) {
                        let new_Food = food_add();
                        io.emit('draw', { fillStyle: '#00FF00', x: arr_sq[new_Food].x, y: arr_sq[new_Food].y });
                    }
                }
            } catch (e) {
                socket.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });

        function went(id) {
            try {
                clearInterval(player[id].timer);
                player[id].timer = setInterval(function go() {

                    for (let index = 0; index <= player[id].sq_size; index++) {
                        player[id].lastX[index] = player[id].lastX[index + 1];
                        player[id].lastY[index] = player[id].lastY[index + 1];
                    }
                    io.emit('eraser', { id: id, x: player[id].lastX[0], y: player[id].lastY[0] });
                    try {
                        arr_sq[player[id].lastX[0] + "_" + player[id].lastY[0]].busy_id = '-1';
                    } catch (e) {
                        console.log(player[id].lastX[0] + "_" + player[id].lastY[0]);
                        console.log(arr_sq[player[id].lastX[0] + "_" + player[id].lastY[0]]);
                        console.log(e);
                    }

                    switch (player[id].side) {
                        case "top":
                            player[id].y -= 20;
                            break;
                        case "down":
                            player[id].y += 20;
                            break;
                        case "left":
                            player[id].x -= 20;
                            break;
                        case "right":
                            player[id].x += 20;
                            break;
                    }
                    if ((arr_sq[player[id].x + "_" + player[id].y].busy_id == "-1") || (arr_sq[player[id].x + "_" + player[id].y].busy_id == id)) {

                        if (arr_sq[player[id].x + "_" + player[id].y].border == false) {

                            if (arr_sq[player[id].x + "_" + player[id].y].food == true) {
                                player[id].sq_size++;
                                io.emit("laeder", {
                                    id: player[id].id,
                                    name: player[id].name,
                                    sq_size: player[id].sq_size,
                                });
                                let new_Food = food_add();

                                io.emit('draw', { fillStyle: '#00FF00', x: arr_sq[new_Food].x, y: arr_sq[new_Food].y });
                            }
                            player[id].lastX[player[id].sq_size] = player[id].x;
                            player[id].lastY[player[id].sq_size] = player[id].y;
                            arr_sq[player[id].lastX[player[id].sq_size] + "_" + player[id].lastY[player[id].sq_size]].busy_id = id;

                            io.emit("draw", {
                                fillStyle: player[id].color_head,
                                id: player[id].id,
                                x: player[id].x,
                                y: player[id].y,
                                head: true
                            });

                            for (let index = 1; index < player[id].sq_size; index++) {
                                io.emit("draw", {
                                    fillStyle: player[id].color_body,
                                    id: player[id].id,
                                    x: player[id].lastX[index],
                                    y: player[id].lastY[index],
                                    head: false
                                });
                            }

                        } else {
                            console.log("Ударился лбом");
                            clearInterval(player[id].timer);
                        }
                    } else {
                        console.log("Он врезался в змейку");
                        clearInterval(player[id].timer);
                    }

                }, 250)
            } catch (e) {
                console.log(e);
            }

        }

        socket.on('disconnect', function(e) {
            try {
                clearInterval(player[socket.id].timer);
                io.emit('eraser', { id: socket.id, x: player[socket.id].x, y: player[socket.id].y });
                arr_sq[player[socket.id].x + "_" + player[socket.id].y].busy_id = '-1';
                for (let ind = 0; ind < player[socket.id].sq_size; ind++) {
                    io.emit('eraser', { id: socket.id, x: player[socket.id].lastX[ind], y: player[socket.id].lastY[ind] });
                    arr_sq[player[socket.id].lastX[ind] + "_" + player[socket.id].lastY[ind]].busy_id = '-1';
                }
                console.log('Кто-то ушел, осталось: ' + player.length);
            } catch (e) {
                socket.emit("updatepg", 1);
                console.log("Поймал ошибку: " + e);
            }
        });
    } catch (e) {
        socket.emit("updatepg", 1);
        console.log("Поймал ошибку: " + e);
    }

});

var port = 3003;
http.listen(port, function() {
    console.log('listening on:' + port);
})