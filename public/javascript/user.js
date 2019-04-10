function add_question(json){
	let questions = $('.questions');
	let q_element = link('/q/' + json.question.id, json.question.title);
	questions.append(list_group_item(q_element));
}

function add_answer(json){
	let answers = $('.answers');
	let a_element = link('/q/' + json.question.id, "Question: " + json.question.title) +
		'\n<p>Answer: ' + json.answer + '</p>';
	answers.append(list_group_item(a_element));
}

function update_answers(json){
	for (let i = 0; i < json.answers.length; i++){
		$.ajax({
			url: '/answers/' + json.answers[i],
			type: 'GET',
			success: add_answer
		});
	}
}

function update_questions(json){
	for (let i = 0; i < json.questions.length; i++){
		$.ajax({
			url: '/questions/' + json.questions[i],
			type: 'GET',
			success: add_question
		});
	}
}

function send_request(){
	let user = window.location.pathname.substr(2);
	$.ajax({
		url: '/user' + user + '/questions',
		type: 'GET',
		success: update_questions
	});

	$.ajax({
		url: '/user' + user + '/answers',
		type: 'GET',
		success: update_answers
	});
}

function list_group_item(element){
	return "<li class='list-group-item'>" + element + "</li>"
}

$('document').ready(send_request);