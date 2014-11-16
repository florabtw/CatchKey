var server = 'http://198.199.104.128:5000'
var numRows = 1;

function addRow() {
    var question = createInput('question' + numRows);
    var keywords = createInput('keywords' + numRows);
    numRows++;
    var btnRemove = $('<button/>').attr('type', 'button').text('-')

    var row = $('<div/>')
        .addClass('q-row')
        .append(question)
        .append(keywords)
        .append(btnRemove);

    btnRemove.click(function() {
      row.remove();
    });

    $('.q-table').eq(0).append(row);
}

function createInput(name) {
    return $('<div/>').append(
        $('<input/>').attr('type', 'text').attr('name', name)
    );
}

function setQuestions() {
    var url = server + '/CatchKey/questions';
    var data = $('#questions').serialize();

    $.post(url, data, function() {
        alert('success!');
    });
}
