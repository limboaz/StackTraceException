function initialize(){

}

function reload_page(){
	location.reload(true);
}

function logout(){
	$.ajax({
		url: '/logout',
		type: 'POST',
		success: reload_page
	})
}

function results(json){
	let questions = json.questions;
	let results = $('#results');
	results.empty();
	
	let odiv = '<li class="list-group-item">';
	let cdiv = '</li>';
	for (let i = 0; i < questions.length; i++){
		results.append(odiv + link('/q/' + questions[i].id, questions[i].title) + cdiv);
	}
}

function link(url, body){
	if (!body) body = '';
	return '<a href=\"' + url + '">' + body + '</a>';
}

function search(){
	let params = {q: $('#search_bar').val()};
	$.ajax({
		url: '/search',
		type: 'POST',
		data: JSON.stringify(params),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: results
	});
	return false;
}

$(document).ready(initialize);