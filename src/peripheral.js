var util = require('util');

//
// Require bleno peripheral library.
// https://github.com/sandeepmistry/bleno
//
var bleno = require('bleno');

//
// KycAuthentificationMessage
// * has crust
// * has toppings
// * can be baked
//
var kycAuthentificationMessage = require('./kycAuthentificationMessage');

//
// The BLE KycAuthentificationMessage Service!
//
var KycService = require('./kyc-service');

//
// A name to advertise our KycAuthentificationMessage Service.
//
var name = 'IOTA';
var kycService = new KycService(new kycAuthentificationMessage.KycAuthentificationMessage());

//
// Wait until the BLE radio powers on before attempting to advertise.
// If you don't have a BLE radio, then it will never power on!
//
bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    //
    // We will also advertise the service ID in the advertising packet,
    // so it's easier to find.
    //
    bleno.startAdvertising(name, [kycService.uuid], function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
  else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(err) {
  if (!err) {
    console.log('advertising...');
    //
    // Once we are advertising, it's time to set up our services,
    // along with our characteristics.
    //
    bleno.setServices([
      kycService
    ]);
  }
});
