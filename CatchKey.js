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
    );

app.get('/instructions', function(request, response) {
  var caller = request.query.Caller;
  console.log(caller)
  response.end( 
    BeginCallTemplate( { company : 'catchKey' } ));
})

app.get('/completed', function(request,response) {
  response.end();
})

/* recording helpers */

app.post('/:company/recording',function(request, response) {
  var questionNo = request.query.recording || 0,
    company = request.params.company,
    caller = request.data,
    called = request.body.Called;
    console.log(request.body)
})
app.listen(5000);

