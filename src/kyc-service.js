var util = require('util');
var bleno = require('bleno');

var KycCharacteristic = require('./kyc-characteristic');

function KycService(kycAuthentification) {
    console.log("KYC Service");
    bleno.PrimaryService.call(this, {
        uuid: '13333333333333333333333333333337',
        characteristics: [
            new KycCharacteristic(kycAuthentification)
        ]
    });
}

util.inherits(KycService, bleno.PrimaryService);

module.exports = KycService;
