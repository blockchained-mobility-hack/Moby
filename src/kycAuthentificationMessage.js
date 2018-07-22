var util = require('util');
var events = require('events');


function KycAuthentificationMessage() {
  events.EventEmitter.call(this);
}

util.inherits(KycAuthentificationMessage, events.EventEmitter);

KycAuthentificationMessage.prototype.processMessage = function(toCheck, validationResult) {
  console.log("New KYC Authentification Message");
  console.log("Validation Result: ");
  console.log(validationResult);
  console.log("ToCheck Result: ");
  console.log(toCheck);

  if(toCheck === validationResult){
    console.log("IT IS VALID!");
  }else{
    console.log("NOT VALID!");
  }

  var self = this;
  setTimeout(function() {
    console.log("Send Ready");
    self.emit('ready', validationResult);
  }, 200);
};

module.exports.KycAuthentificationMessage = KycAuthentificationMessage;
