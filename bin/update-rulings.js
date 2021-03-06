var util = require('util'),
    Gatherer = require('../src/gatherer'),
    Oracle = require('../src/models/oracle'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio');

mongoose.connect('mongodb://localhost/mtgio');

var stream = Oracle.find().stream();
var processing = 0;
stream.on('data', function(card) {
  processing++;
  if(processing > 10) {
    stream.pause();
  }
  var gatherer = new Gatherer(card.printings[0]._id);
  gatherer.getRulings(function(rulings) {
    processing--;
    if(processing < 6) {
      stream.resume();
    }
    var count = rulings.length - card.rulings.length;
    if(count > 0) {
      card.rulings = rulings;
      card.save(function(err) {
        console.log(card.name, 'has', count, 'new rulings');
      });
    }
  });
}).on('error', function(err) {
  console.log('error!', err);
}).on('close', function() {
  console.log('done');
});
