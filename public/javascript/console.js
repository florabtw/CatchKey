var server = 'http://198.199.104.128:5000'
var numRows = 1;

$(document).ready(function() {
    getQuestions();
});

function addRow() {
    addQuestion("", "");
}

function addQuestion(question, keywords) {
    var question = createInput('question' + numRows, question);
    var keywords = createInput('keywords' + numRows, keywords);
    numRows++;
    var btnRemove = createButton();

    btnRemove.find('button').eq(0).click(function() {
        question.remove();
        keywords.remove();
        btnRemove.remove();
    });

    $('#questions')
        .append(question)
        .append(keywords)
        .append(btnRemove);
}

function createButton() {
    return $('<div/>')
        .addClass('pure-u-1-5')
        .append(
            $('<button/>')
                .addClass('pure-u-2-5 button-error pure-button')
                .attr('type', 'button')
                .text('Remove')
        );
}

function createInput(name, text) {
    return $('<div/>')
        .addClass('pure-u-2-5')
        .append(
            $('<input/>')
                .addClass("pure-input-1")
                .attr('type', 'text')
                .attr('name', name)
                .val(text)
        );
}

function setQuestions() {
    var url = server + '/CatchKey/questions';
    var data = $('#questions').serialize();

    $.post(url, data, function() {
        alert('success!');
    });
}

function getQuestions() {
    url = server + '/CatchKey/questions'

    $.get(url, function(data) {
        var firstQ = data.shift();

        $('#first-q').val(firstQ.question);
        $('#first-k').val(firstQ.keywords);

        addQuestions(data);
    });
}

function addQuestions(questions) {
    $.each(questions, function(i, val) {
        addQuestion(val.question, val.keywords);
    });
}
