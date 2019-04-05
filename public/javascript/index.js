function initialize(){

}

function results(json){
	let questions = json.questions;
	let results = $('#results');
	let odiv = '<div>';
	let cdiv = '</div>';
	for (let i = 0; i < questions.length; i++){
		results.append(odiv + link('/quest/' + questions[i].id, questions[i].title) + cdiv);
	}
}

function link(url, body){
	if (!body) body = '';
	return '<a href=\"' + url + '">' + body + '</a>';
}

function search(){
	console.log("hello");
	$.ajax({
		url: '/search',
		type: 'POST',
		data: JSON.stringify(),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: results
	});
	return false;
}

$(document).ready(initialize);