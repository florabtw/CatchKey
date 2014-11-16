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
  CandidatesTemplate =
  hbs.compile(
    ''+fs.readFileSync('templates/candidates.html','utf8')
    );


app.get('/instructions', function(request, response) {
  response.setHeader('content-type', 'application/xml')
  response.end( 
    BeginCallTemplate( { company : 'CatchKey' } ));

})

app.get('/:company/candidates', function(request, response) {
    var company = request.params.company;
    var candidates = {
        '458-343-5567': {
            questions:
                [
                    { question: 'What day is it?',
                      recording: 'http://soundoftext.com/audio/English/what.mp3',
                      score: 3
                    },
                    { question: 'Is OOP good?',
                      recording: 'google.com',
                      score: 5
                    }
                ],
            total: 8
        },
        '573-456-2355': {
            questions:
                [
                    { question: 'What day is it?',
                      recording: 'google.com',
                      score: 2
                    },
                    { question: 'Is OOP good?',
                      recording: 'google.com',
                      score: 4
                    }
                ],
            total: 6
        }
    };

    response.end(CandidatesTemplate({ company: company, candidates: candidates }));
})

app.get('/:company/questions', function( request, response) {
  var company = request.params.company;
  db.Company.findOne({'name':company},function(error,co) {
    var questions = co.questions;
    for (var i in questions) {
      questions[i].keywords = questions[i].answers
    }
    response.json(questions);
  })
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

 
var credentials = require('./credentials.js');
var clarifyio = require('clarifyio');
var client = new clarifyio.Client("api.clarify.io", credentials.key);
function clarifyQuery( query ) {
  setTimeout(function() {
            client.search({
                query: query,
                filter: 'bundle.name=="test bundle"'
            },function(e, data) {
                console.log(e)
                console.log(data)
            })
        }, 1000*10);
}
function analyzeCandidate(company, candidatePhoneNumber) {
  // get candidate audio
  db.Company.findOne({ name: company}, function( error, co) {
    var can = co.candidates[ candidatePhoneNumber ]
    console.log(co.questions);

      // client.createBundle({
      //   media_url : can[i].answer,
      //   name : can[i].answer
      // },function(){
      //   console.log(arguments)
      // })

    var questions = co.questions;
    for (var i in questions) {
        var question = questions[i];

        if (!question.answers) {
            return;
        }

        var query = question.answers.reduce(function(acc,x) {
            return acc + ' | ' + x;
        },"");

        console.log(query);
        clarifyQuery( query );
        // var bundleName = question.question + candidatePhoneNumber
        
    }

    //client.search
  // upload to clarify
  //client.createBundle('url', function())
  })
}

analyzeCandidate('CatchKey', '+13148537371');

function score(result) {
    itemResults = result.item_results;
    return sumItemResults(itemResults);
}

function sumItemResults(results) {
    return sumProperty(results, sumTermResults, 'term_results');
}

function sumTermResults(results) {
    return sumProperty(results, sumMatches, 'matches');
}

function sumMatches(results) {
    return sumProperty(results, function(x) { return x.length }, 'hits');
}

function sumProperty(results, func, prop) {
    return results.reduce(function(acc, x) {
        return acc + func(x[prop]);
    }, 0);
}

//module.exports.analyze = analyzeCandidate;
/* recording helpers */
app.post('/:company/recording',function(request, response) {
  response.setHeader('content-type', 'application/xml')
  var 
    questionNo = request.query.question/1 || 0,
    company = request.params.company,
    caller = request.body.Caller,
    recording = request.body.RecordingUrl;
    console.log('this quiestion:', questionNo);

    if (recording){
      // db.saveCandidateResponse(
      //   company, questionNo - 1, caller, recording );
    }
    // if ( questionNo > 0 && ( request.body.RecordingDuration/1 < 4 || (!recording && !retry) )) {      
    //   response.end( RetryTemplate({ 'company': company, 'questionNo': questionNo }));
    //   return;
    // }

    db.questionExists(
      company, questionNo, function( bool, co ) {
        if (bool) {
          response.end(
          HangupTemplate());
          analyzeCandidate(company, caller);
        } 
        else {
          console.log(co.questions[ questionNo ].question)
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

