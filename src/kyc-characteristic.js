var util = require('util');
var bleno = require('bleno');
var kycAuthentificationMessage = require('./kycAuthentificationMessage');

var MerkleHashClaim = require('./MerkleHashClaim');

var ValidatyCheck = require('./ValidatyCheck');

function KycCharacteristic(kycAuthentificationMessage) {
  console.log('KYC Characteristics');
  console.log(kycAuthentificationMessage);
  bleno.Characteristic.call(this, {
    uuid: '13333333333333333333333333330002',
    properties: ['notify', 'read', 'write'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2903fff1',
        value: 'Gets or Set the KYC.'
      })
    ]
  });

  this.kycAuthentificationMessage = kycAuthentificationMessage;
}

util.inherits(KycCharacteristic, bleno.Characteristic);

KycCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log("on WRITE Request");
  var jsonString = data.toString();
  console.log(jsonString);

  var json = JSON.parse(jsonString);

  var filteredJson = json[0];

    var toCheck = MerkleHashClaim(filteredJson);
    console.log("Got Result by MerkleHashClaim");
    console.log(toCheck);

    console.log("claim address");
    console.log(json[2]);
    var claimAddress = json[2];
    console.log("user address");
    var userAddress = json[1];
    console.log(userAddress);


    var validatyCheckPromise = ValidatyCheck(toCheck, claimAddress, userAddress);

    var self = this;

    this.kycAuthentificationMessage.once('ready', function(result) {
      console.log("on Message ready");
        if (self.updateValueCallback) {
            console.log("data callback ready called.");
            console.log("Sending data back.");
            var data = new Buffer(1);
            data.writeUInt8(1, 0);
            self.updateValueCallback(data);
        }
    });

    validatyCheckPromise.then((validationToCheck) => {
        console.log("Validation Check Result.");
        console.log(validationToCheck);
        this.kycAuthentificationMessage.processMessage(toCheck, validationToCheck);
    });

    validatyCheckPromise.catch((error) => {
      console.log("Validity Error!");
      console.log(error);
    });


    callback(this.RESULT_SUCCESS);

  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  }
  else if (data.length !== 2) {
    callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  }
  else {

    //this.kycAuthentification.toppings = data.readUInt16BE(0);
    callback(this.RESULT_SUCCESS);
  }
};

KycCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log("On Read Request");

  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG, null);
  }
  else {
    var data = new Buffer(2);

    //data.writeUInt16BE(this.kycAuthentification.toppings, 0);
    callback(this.RESULT_SUCCESS, data);
  }
};

module.exports = KycCharacteristic;