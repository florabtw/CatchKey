"Use Strict"
var express = require('express'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  hbs = require('handlebars'),
  morgan = require('morgan'),
  path = require('path'),
  db = require('./database.js'),
  fs = require('fs'),
  app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(request, response) {
  response.end('Hello World!');
})

/* caching the handlebars rendering */
const
  BeginCallTemplate = 
  hbs.compile(
    ''+fs.readFileSync('templates/BeginCall.xml','utf8') 
    ),
  QuestionTemplate = 
  hbs.compile(
    ''+fs.readFileSync('templates/Question.xml','utf8')
    ),
  HangupTemplate =
  hbs.compile(
    ''+fs.readFileSync('templates/Hangup.xml','utf8')
    ),
  RetryTemplate = 
  hbs.compile(
    ''+fs.readFileSync('templates/Retry.xml','utf8')
    );


app.get('/instructions', function(request, response) {
  response.setHeader('content-type', 'application/xml')
  response.end( 
    BeginCallTemplate( { company : 'CatchKey' } ));

})

app.post('/:company/questions', function( request, response) {
    response.end('thanks');
    console.log(request.body);
    var questions = [];
    for (var key in request.body) {
      if (key.indexOf('question') >= 0 && request.body[key].length > 0) {

        var num = key.substring( 'question'.length );
        var answers = request.body[ 'keywords'+num ];
        var question = request.body[ 'question'+num ];
        questions.push( {'question': question, 'answers': answers.split(',') } )
      }
    }
    console.log(questions)
    var company = request.params.company;
    db.saveQuestionSet( company, questions );
})

app.get('/completed', function(request,response) {
  response.end();
})

/* recording helpers */

app.post('/:company/recording',function(request, response) {
  response.setHeader('content-type', 'application/xml')
  var 
    questionNo = request.query.question/1 || 0,
    company = request.params.company,
    caller = request.body.Caller,
    recording = request.body.RecordingUrl;
    retry = request.query.retry/1;
    console.log(request.body)
    console.log(questionNo > 0, questionNo, recording)

    if (recording){
      db.saveCandidateResponse(
        company, questionNo - 1, caller, recording );
    }
    if ( request.body.RecordingDuration/1 < 2 || (!recording && !retry) ) {      
      response.end( RetryTemplate({ 'company': company, 'questionNo': questionNo }));
      return;
    }

    db.questionExists(
      company, questionNo, function( bool, co ) {
        if (bool) {
          response.end(
          HangupTemplate());
        } 
        else {
          response.end(
            QuestionTemplate({
              'question' : co.questions[ questionNo ].question,
              'questionNo' : questionNo + 1,
              'company' : company
            }))
        }
      });

})
app.listen(5000);

