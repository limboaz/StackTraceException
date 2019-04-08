var answer = {user: "", body: ""};

function result(json){
    if (json.status !== 'OK') return alert(json.error);
    let list = $('.list-group');
    let url = "/user/" + answer.user + "/answers";
    list.append('<h6>${answer.body}</h6>\n' + '<a href=' + url + '>- ${answer.user}</a>');
}

function delete_question() {
    let id = window.location.pathname.split('/')[2];
    $.ajax({
        url: '/questions/' + id,
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    });
}

function add_answer() {
    let params = {body: $('#add_body').val()};
    let id = window.location.pathname.split('/')[2];
    $.ajax({
        url: '/questions/' + id + '/answers/add',
        type: 'POST',
        data: JSON.stringify(params),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: result
    });
}