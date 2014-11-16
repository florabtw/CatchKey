var server = 'http://198.199.104.128:5000'
var numRows = 1;

$(document).ready(function() {
    getQuestions();
});

function addRow() {
    addQuestion("", "", "");
}

function addQuestion(question, keywords, goal) {
    var question = createInput('question' + numRows, question, 'pure-u-9-24');
    var keywords = createInput('keywords' + numRows, keywords, 'pure-u-9-24');
    var goal = createInput('goal' + numRows, goal, 'pure-u-3-24');
    numRows++;
    var btnRemove = createButton();

    btnRemove.click(function() {
        question.remove();
        keywords.remove();
        goal.remove();
        btnRemove.remove();
    });

    $('#q-grid')
        .append(question)
        .append(keywords)
        .append(goal)
        .append(btnRemove);
}

function createButton() {
    return $('<button/>')
            .addClass('pure-u-3-24 button-error pure-button')
            .attr('type', 'button')
            .text('Remove');
}

function createInput(name, text, size) {
    return $('<input/>')
            .addClass(size)
            .attr('type', 'text')
            .attr('name', name)
            .val(text)
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
        $('#first-g').val(firstQ.goal);

        $('#minimum').val(firstQ.minimum);

        addQuestions(data);
    });
}

function addQuestions(questions) {
    $.each(questions, function(i, val) {
        addQuestion(val.question, val.keywords, val.goal);
    });
}
