let client = 'O';
let turn = true;

let game = {
	grid: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	winner: ''
};

let check_win = function (player) {
	if (game.winner !== '') return;
	let inARow = 0, inACol = 0, diag = 0, rdiag = 0;

	for (let i = 0; i < 3; i++) {
		if (game.grid[3 * i + i] === player) diag++;
		if (game.grid[3 * i + 2 - i] === player) rdiag++;

		for (let j = 0; j < 3; j++) {
			if (game.grid[3 * i + j] === player) inARow++;
			if (game.grid[3 * j + i] === player) inACol++;

			if (inARow === 3 || inACol === 3) {
				game.winner = player;
				return;
			}
		}
		inACol = 0; inARow = 0;
	}
	if (diag === 3 || rdiag === 3)
		game.winner = player;
};

let c_move = function (res) {
	game = res;
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			let cell = $("#row-" + row).find(".c-" + col);
			cell.text(game.grid[3 * row + col])
		}
	}
	check_win("X");
	turn = true;
};

let p_move = function (row, col) {
	if (game.grid[3 * row + col] !== ' ' || !turn || game.winner !== '') return;
	game.grid[3 * row + col] = client;
	check_win(client);

	let cell = $("#row-" + row).find(".c-" + col);
	cell.text(client);

	turn = false;
	$.ajax({
		url: '/ttt/play',
		type: 'POST',
		data: JSON.stringify(game),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: c_move
	});
	console.log(game.grid)
};

let load_game = function (res) {
	let board = $(".board");
	board.text(res);
	for (let i = 0; i < 3; i++) {
		let cl = i !== 2 ? "border-bottom border-dark" : "";
		board.append("<div class='row " + cl + "' id='row-" + i + "'></div>");
		var row = $('#row-' + i);
		for (let j = 0; j < 3; j++) {
			cl = j !== 2 ? "border-right border-dark" : "";
			row.append("<div class='square col " + cl + " c-" + j + "' onclick='p_move(" + i + ", " + j + ")'></div>")
		}
	}
};

$(document).ready(function(){
	$(".submit").click(function(){
		$.post("/ttt/", $(".input").val(), load_game);
	})
});