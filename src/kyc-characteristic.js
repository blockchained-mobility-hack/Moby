var util = require('util');
var bleno = require('bleno');
var kycAuthentificationMessage = require('./kycAuthentificationMessage');

var MerkleHashClaim = require('./MerkleHashClaim');

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

    var result = MerkleHashClaim(jsonString);
    console.log("Got Result by MerkleHashClaim");
    console.log(result);

    var self = this;
    this.kycAuthentificationMessage.once('ready', function(result) {
      console.log("on Message ready");
        if (self.updateValueCallback) {
            console.log("data callback ready");
            var data = new Buffer(1);
            data.writeUInt8(result, 0);
            self.updateValueCallback(data);
        }
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