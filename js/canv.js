var socket = io();
var canv = document.getElementById('canvas');
var ctx = canv.getContext("2d");
var leaderboard = $(".leader_board");
var inputs = $(".inputs")
leaderboard.offset({
    top: 25,
    left: window.innerWidth - leaderboard.width() - 25,
});
inputs.offset({
    top: Math.floor(window.innerHeight / 2) - 100,
    left: Math.floor(window.innerWidth / 2) - 100,
});


leaderboard.html("<p>Таблица лидеров</p>");
//leaderboard.append("<p>Второй тест</p>");
leaderboard.append('<p id="me">Третий тест</p>');
var me_laeder = $("#me");
var leaders = [];
var leader_num = 0;

function isInteger(num) {
    return (num ^ 0) === num;
}
$('canvas').bind('contextmenu', function(e) {
    return false;
});
socket.on('updatepg', function(ans) {
    location.reload();
});

function getRandomArbitrary(min, max) {
    var norm = Math.floor(Math.random() * (max - min) + min);
    if (isInteger(norm / 20)) return norm;
    else return getRandomArbitrary(min, max);
}

var click_cord = {
    id: 1,
    oldx: 1,
    oldy: 1,
    x: 1,
    y: 1,
};
var player_set = {
    id: -1,
    name: "Player",
    x: getRandomArbitrary(60, 500),
    y: getRandomArbitrary(60, 500),
    color_head: "red",
    color_body: "blue",
    sq_size: 4,
    side: "right",
    speed: 1,
    admin: false,
    lastX: [],
    lastY: [],
    timer: 1,
};
var last = {
    x: 1,
    y: 1,
};



window.addEventListener("message", function listener(event) {
    let game_start = event.data;
    player_set.name = game_start.login;
    me_laeder.html('<p id="me"> [' + player_set.sq_size + '] ' + game_start.login + '</p>');
    player_set.color_body = game_start.body;
    player_set.color_head = game_start.head;
    if (game_start.admin == 1)
        player_set.admin = true;
    else game_start.admin = false;
    socket.emit('player_num_req', 1);
});
//socket.emit('player_num_req', 1);
var flag = false;
socket.on('player_num_ans', function(msg) {
    if (flag == false) {
        player_set.id = msg;
        flag = true
    }
    socket.emit('add_user', player_set);
    console.log("Player created");
});


socket.on('draw', function(ans) {
    ctx.fillStyle = ans.fillStyle;
    ctx.lineWidth = 5;
    ctx.fillRect(ans.x, ans.y, 20, 20);
    ctx.strokeStyle = '#0e2f44';
    ctx.lineWidth = 1;
    ctx.strokeRect(ans.x, ans.y, 20, 20);
    if (ans.head == true) {
        if (player_set.id == ans.id) {
            window.scrollTo(ans.x - Math.floor(window.innerWidth / 2), ans.y - Math.floor(window.innerHeight / 2));
            leaderboard.offset({
                top: 50 + window.pageYOffset,
                left: window.innerWidth - leaderboard.width() - 50 + window.pageXOffset,
            })
        }
    }
});

socket.on("laeder", function(ans) {
    if (ans.id == player_set.id)
        me_laeder.html('<p id="me"> [' + ans.sq_size + '] ' + ans.name + '</p>');
    else
    if (leaders[ans.id] == null) {
        leaders[ans.id] = {
            id: ans.id,
            name: ans.name,
        };
        me_laeder.before('<p id="' + ans.name + '"> [' + ans.sq_size + '] ' + ans.name + '</p>');
    } else
        $("#" + ans.name).html('<p id="' + ans.name + '"> [' + ans.sq_size + '] ' + ans.name + '</p>');

});

socket.on('eraser', function(ans) {
    console.log("[ " + ans.id + "] Стер " + ans.x + " " + ans.y);
    ctx.fillStyle = '#335066';
    ctx.lineWidth = 5;
    ctx.fillRect(ans.x, ans.y, 20, 20);
    ctx.strokeStyle = '#0e2f44';
    ctx.lineWidth = 1;
    ctx.strokeRect(ans.x, ans.y, 20, 20);
});

socket.on('send border', function(arr_sq) {
    console.log(arr_sq);;
    ctx.clearRect(0, 0, arr_sq.field_height, arr_sq.field_width);
    canv.width = arr_sq.field_height;
    canv.height = arr_sq.field_width;
    for (let ind = 0; ind < arr_sq.field_height; ind += 20) {
        for (let inde = 0; inde < arr_sq.field_width; inde += 20) {
            ctx.strokeStyle = '#0e2f44';
            ctx.lineWidth = 1;
            ctx.strokeRect(ind, inde, 20, 20);
        }
    }
    console.log("Поле очищено");

});

window.addEventListener('resize', function resize() {
    if (!socket) return;
    leaderboard.offset({
        top: 25,
        left: window.innerWidth - leaderboard.width() - 25,
    })
    inputs.offset({
        top: Math.floor(window.innerHeight / 2) - 100,
        left: Math.floor(window.innerWidth / 2) - 100,
    });
    socket.emit('windowResized');
});


var clicked = false;
canv.addEventListener('mousedown', function(e) {
    draw_click.id = player_set.id;
    draw_click.x = currect_click(e.pageX);
    draw_click.y = currect_click(e.pageY);
    console.log(draw_click.x + " " + last.x);
    if ((draw_click.x !== last.x) || (draw_click.y !== last.y)) {
        if (e.which == 3) {
            click_cord.id = player_set.id;
            click_cord.oldx = player_set.x;
            click_cord.oldy = player_set.y;
            click_cord.x = currect_click(e.pageX);
            click_cord.y = currect_click(e.pageY);
            socket.emit('player_rghtclick', click_cord);
            console.log(click_cord.x + " " + click_cord.y);
        }
        if ((draw_click.x == 20) && (draw_click.y == 20)) {
            color_ch.color = '#FF0000';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 20) && (draw_click.y == 40)) {
            color_ch.color = '#00FF00';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            console.log(draw_click.x + " Отчистка " + draw_click.y);
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 20) && (draw_click.y == 60)) {
            color_ch.color = '#0000FF';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 20) && (draw_click.y == 80)) {
            color_ch.color = '#1e84d4';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 20) && (draw_click.y == 100)) {
            color_ch.color = '#010101';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 20) && (draw_click.y == 120)) {
            color_ch.color = '#FFFFFF';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 20) && (draw_click.y == 140)) {
            color_ch.color = '#ffff66';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }

        if ((draw_click.x == 40) && (draw_click.y == 20)) {
            color_ch.color = '#ff5546';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 40) && (draw_click.y == 40)) {
            color_ch.color = '#ff87a5';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 40) && (draw_click.y == 60)) {
            color_ch.color = '#8405cc';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 40) && (draw_click.y == 80)) {
            color_ch.color = '#5a3313';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 40) && (draw_click.y == 100)) {
            color_ch.color = '#30D5C8';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 40) && (draw_click.y == 120)) {
            color_ch.color = '#ff0777';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }
        if ((draw_click.x == 40) && (draw_click.y == 140)) {
            color_ch.color = '#969696';
            color_ch.id = player_set.id;
            shift = false;
            clicked = false;
            socket.emit('color_change', color_ch);
        }

        socket.emit('player_click', draw_click);
        console.log(draw_click.x + " " + draw_click.y);
        if (e.which == 1) {
            clicked = true;
            if (e.shiftKey == 1) {
                shift = true;
                draw_click.id = player_set.id;
                draw_click.x = currect_click(e.pageX);
                draw_click.y = currect_click(e.pageY);
                socket.emit('player_eraser', draw_click);
                console.log(draw_click.x + " Отчистка " + draw_click.y);
            }
        }
        last.x = draw_click.x;
        last.y = draw_click.y;
    }

});
var draw_click = {
    id: 1,
    x: 1,
    y: 1,
}
var shift = false;
canv.addEventListener('mouseup', function(e) {
    clicked = false;
    shift = false;
});
var color_ch = {
    id: player_set.id,
    color: "red",
}
canv.addEventListener('mousemove', function(e) {
    if (clicked == true) {
        draw_click.x = currect_click(e.pageX);
        draw_click.y = currect_click(e.pageY);
        if ((draw_click.x !== last.x) || (draw_click.y !== last.y)) {

            if ((draw_click.x == 20) && (draw_click.y == 20)) {
                color_ch.color = '#FF0000';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 20) && (draw_click.y == 40)) {
                color_ch.color = '#00FF00';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                console.log(draw_click.x + " Отчистка " + draw_click.y);
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 20) && (draw_click.y == 60)) {
                color_ch.color = '#0000FF';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 20) && (draw_click.y == 80)) {
                color_ch.color = '#1e84d4';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 20) && (draw_click.y == 100)) {
                color_ch.color = '#010101';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 20) && (draw_click.y == 120)) {
                color_ch.color = '#FFFFFF';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 20) && (draw_click.y == 140)) {
                color_ch.color = '#ffff66';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }

            if ((draw_click.x == 40) && (draw_click.y == 20)) {
                color_ch.color = '#ff5546';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 40) && (draw_click.y == 40)) {
                color_ch.color = '#ff87a5';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 40) && (draw_click.y == 60)) {
                color_ch.color = '#8405cc';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 40) && (draw_click.y == 80)) {
                color_ch.color = '#5a3313';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 40) && (draw_click.y == 100)) {
                color_ch.color = '#30D5C8';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 40) && (draw_click.y == 120)) {
                color_ch.color = '#ff0777';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if ((draw_click.x == 40) && (draw_click.y == 140)) {
                color_ch.color = '#969696';
                color_ch.id = player_set.id;
                shift = false;
                clicked = false;
                socket.emit('color_change', color_ch);
            }
            if (clicked == true) {
                if (shift == true) {
                    draw_click.id = player_set.id;
                    draw_click.x = currect_click(e.pageX);
                    draw_click.y = currect_click(e.pageY);
                    socket.emit('player_eraser', draw_click);
                    console.log(draw_click.x + " Отчистка " + draw_click.y);
                    last.x = 2;
                    last.y = 2;
                } else {
                    draw_click.id = player_set.id;
                    draw_click.x = currect_click(e.pageX);
                    draw_click.y = currect_click(e.pageY);
                    socket.emit('player_click', draw_click);
                    console.log(draw_click.x + " " + draw_click.y);
                    last.x = draw_click.x;
                    last.y = draw_click.y;
                }
            }

        }

    }
});

function currect_click(coord) {
    if (isInteger(coord / 20)) return coord;
    else {
        coord--;
        return currect_click(coord);
    }
}

var keyp = {
    id: player_set.id,
    par: 1,
}
document.addEventListener('keydown', function(e) {
    console.log(e.keyCode);
    keyp.id = player_set.id;
    keyp.par = e.keyCode;
    socket.emit('key_press', keyp);
    if (e.keyCode == 67) {
        socket.emit('clear', 1);
    }

});

$(function() {

    $('form').submit(function(e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });
});

$(function() {

    $('form').submit(function(e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
});