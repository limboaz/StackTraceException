function result(json){
    if (json.status !== 'OK') return alert(json.error);
    let list = $('.list-group');
    let url = "/u/" + json.user;
    let odiv = '<li class="list-group-item">';
    let cdiv = '</li>';
    let body = '<h6>' + answer + '</h6>\n';
    let link = '<a href=' + url + '>-' + json.user + '</a>';
    list.append(odiv + body + link + cdiv);
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
    let body = $('#add_body')[0];
    let params = {body: body.value};
    body.value = '';
    let id = window.location.pathname.split('/')[2];
    answer = params.body;
    $.ajax({
        url: '/questions/' + id + '/answers/add',
        type: 'POST',
        data: JSON.stringify(params),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: result
    });
}