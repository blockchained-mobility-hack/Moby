var util = require('util');
var events = require('events');


function KycAuthentificationMessage() {
  events.EventEmitter.call(this);
}

util.inherits(KycAuthentificationMessage, events.EventEmitter);

KycAuthentificationMessage.prototype.processMessage = function(message) {
  console.log("New KYC Authentification Message");
  console.log(message);

  var self = this;
  setTimeout(function() {
    console.log("Send Ready");
    self.emit('ready', message);
  }, 200);
};

module.exports.KycAuthentificationMessage = KycAuthentificationMessage;
