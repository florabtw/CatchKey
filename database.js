var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var CompanySchema = new mongoose.Schema(
{
  'name' : String,
  'questions' : [],
  'candidates' : {}// blobbly
})

var PhoneNumberSchema = new mongoose.Schema(
{
  'phoneNumber' : String,
  'allocated' : false,
  'owner' : String
})

var Company = mongoose.model('Company',CompanySchema);
var PhoneNumber = mongoose.model('PhoneNumber',PhoneNumberSchema);

module.exports.saveQuestionSet = function(company, questionSet) {
  Company.findOne( {name: company}, function( error, co) {
    if (error) {
      throw "mongodb had an error when saving a questionset to the db";
    }
    if (!co) {
      co = new Company({name: company, questions: [], candidates: {}});
    }
    co.questions = questionSet;
    co.markModified('questions');
    co.save();
  })
}

module.exports.saveCandidateResponse = 
    function(company, questionNo, caller, responseUrl ) {
      Company.findOne( {name: company}, function( error, co ) {
        if (error) {
          throw "mongodb shat a brick";
        }
        else {
          // get a company...
          var companyToSave = co;
          if (!companyToSave) {
            throw "company does not exist to save recording for";
          }

          // get a candidate...
          if (!companyToSave.candidates) {
            companyToSave.candidates = {};
            companyToSave.markModified('candidates');
          }
          if (!companyToSave.candidates[caller]){
            companyToSave.candidates[caller] = {};
            companyToSave.markModified('candidates');
          }
          // get the current question...
          var question = companyToSave.questions[ questionNo ];
          if (!question){
            throw "question No has no corresponding question in the company question set";
          }
          companyToSave.candidates[caller][questionNo] = {
            'question': question,
            'answer': responseUrl
          };
          companyToSave.markModified('candidates');
          console.log(companyToSave)
          companyToSave.save(function(error) {
            if(error){
              throw "response failed to save to mongodb";
            }
          });
        }
      })
}
module.exports.isLastQuestion = 
    function( company, questionNo, funct ) {
      Company.findOne({ name: company}, function(error, co) {
        if (error) {
          throw "mongo failed hard when looking up a company for 'isLastQuestion'";
        }
        else if (!co) {
          throw "mongo failed to find this company "+company;
        }
        else {
          if (funct) {
            console.log('last query?', questionNo, co.questions.length );
            funct( questionNo >= co.questions.length, co );
          }
        }
      })
}

module.exports.Company = Company;
module.exports.PhoneNumber = PhoneNumber;

