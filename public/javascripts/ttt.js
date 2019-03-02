let client = 'O';
let turn = true;

let game = {
	grid: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	move: null
};

let won = false;

let c_move = function (res) {
	game.grid = res.grid;
	if (res.winner !== '') won = true;
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			let cell = $("#row-" + row).find(".c-" + col);
			cell.text(game.grid[3 * row + col])
		}
	}
	turn = true;
};

let p_move = function (row, col) {
	if (game.grid[3 * row + col] !== ' ' || !turn || won) return;
	game.grid[3 * row + col] = client;
	game.move = 3 * row + col;
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
};

let load_game = function () {
	let board = $(".board");
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

$(document).ready(load_game);