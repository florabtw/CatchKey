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
    try {
      db.Company.findOne({ name: company}, function(err, comp){
        if (!comp){
          response.end('');
          return;
        }
        var candidates = comp.candidates;
        var candidatesToReturn = {};
        for (var i in candidates) {
          var flag = false;
          for (var j in candidates[i]) {
            console.log(i,j)
            if (!candidates[i][j].question && j/1 >= 0) {
              console.log( 'ignored', i, j)
              flag = true;
            };
          }
          if (flag === true) {
            continue;
          }
          var total = 0;
          candidatesToReturn[i] = {};
          candidatesToReturn[i].questions = [];
          for (var j in candidates[i]) {
            if (!(j/1 >= 0)) continue;
            candidates[i][j].recording = candidates[i][j].answer;
            candidates[i][j].question = candidates[i][j].question.question
            candidatesToReturn[i].questions.push(candidates[i][j]);
            total += candidates[i][j].score;
          }

          candidatesToReturn[i].total = total;
        }
        console.log(JSON.stringify(candidatesToReturn))
        response.end(CandidatesTemplate({ company: company, candidates: candidatesToReturn }));
      })
    } catch (e) {
      console.log('tried to refresh page too early')
    }
    });

// })

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
        var goal = request.body[ 'goal'+num ];
        questions.push( {'question': question, 'answers': answers.split(','), 'goal':goal, 'minimum': request.body['minimum'] } )
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

var twilio = require('twilio')(credentials.twilio_sid, credentials.twilio_token);
var bundles = {};
function clarifyQuery( query, filter, response, co, funct ) {
  //setTimeout(function() {
        console.log('query!')
            client.search({
                query: query,
                filter: 'bundle.name=="'+filter+'"'
            },function(e, data) {
                console.log(e)
                console.log(JSON.stringify(data))
                console.log('score =>', score( data));
                if (!response) response = bundles[filter]
                response.score = score( data);
                co.markModified('candidates');
                co.save();
                if (funct) {
                  funct( data, response.score, response.question.goal, response.question.minimum, co )
                }
            })
       // }, 1000*30);
}
function clarifyCreateBundle( url, query, bundleName, response, co, funct) {
    bundles[bundleName] = response;
    client.createBundle({
    media_url : url,
    name : bundleName,
    notify_url: 'http://198.199.104.128/'+bundleName.replace(/\s/gm)
  },function(e,d){
    console.log('Create Bundle Response:',e,JSON.stringify(d))
    app.get(bundleName.replace(/\s/gm),function(){
      clarifyQuery( query, bundleName, response, co, funct )
    })
  })
}
//analyzeCandidate('CatchKey', '+13148537371')
var randoPrefix = ''+Math.random();
function analyzeCandidate(company, candidatePhoneNumber) {
  // get candidate audio
  db.Company.findOne({ name: company}, function( error, co) {
    var can = co.candidates[ candidatePhoneNumber ]
    console.log(co.questions);


//    var questions = co.questions;
    for (var i in can) {
        var response = can[i];

        if (!response.answer) {
            return;
        }
        console.log(JSON.stringify(response))
        var bundleName = randoPrefix+company+i+candidatePhoneNumber;
        clarifyCreateBundle(  response.answer, query, bundleName, response, co, function(data, score, goal, min) {
          query_count--;
          console.log('score => goal', score, goal)
          console.log('query count',query_count)
          if ( score >= goal ) {
            passcount++;
          }
          if (query_count == 1) {
            console.log('passcount => min', passcount, min)
            if (passcount >= min) {
              
              twilio.sendMessage(
              {
                to: candidatePhoneNumber,
                from: '+18168446984',
                body: 'Thank you for chatting with me! An employee from '+company+' will give you a call as soon as they can!'
              })
              //console.log("TRYING TO TEXT SUCCESS")
            } else {
              twilio.sendMessage(
              {
                to: candidatePhoneNumber,
                from: '+18168446984',
                body: 'Thank you for chatting with me! Unfortunately, '+company+' has decided to pursue other candidates at this time.'
              })
            }
          }
          //=)
        } )
        console.log('answer=>',response.answer)
        var query = response.question.answers.reduce(function(acc,x) {
            return acc + ' | ' + x;
        },"");

        // console.log(query);
        var passcount = 0;
        var query_count = Object.keys(can).length;
        clarifyQuery();
        // var bundleName = question.question + candidatePhoneNumber
        
    }

    //client.search
  // upload to clarify
  //client.createBundle('url', function())
  })
}

//analyzeCandidate('CatchKey', '+13148537371');

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
      db.saveCandidateResponse(
        company, questionNo - 1, caller, recording );
    }


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

