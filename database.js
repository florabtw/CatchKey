var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var Company = mongoose.model('Company',
{
  'name' : String,
  'candidates' : []// blobbly
})

var PhoneNumber = mongoose.model('PhoneNumber',
{
  'phoneNumber' : String,
  'allocated' : false,
  'owner' : String
})

module.exports.Company = Company;
module.exports.PhoneNumber = PhoneNumber;