var server = 'http://198.199.104.128:5000'
var numRows = 1;

function addRow() {
    var question = createInput('question' + numRows);
    var keywords = createInput('keywords' + numRows);
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

function createInput(name) {
    return $('<div/>')
        .addClass('pure-u-2-5')
        .append(
            $('<input/>')
                .addClass("pure-input-1")
                .attr('type', 'text')
                .attr('name', name)
        );
}

function setQuestions() {
    var url = server + '/CatchKey/questions';
    var data = $('#questions').serialize();

    $.post(url, data, function() {
        alert('success!');
    });
}
