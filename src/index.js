/*const noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
    console.log('Found device with local name: ' + peripheral.advertisement.localName);
    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
    console.log();
});

*/

let bleno = require('bleno');

let advertiseIOTA = () => {
    let name = 'IOTA';
    let serviceUuids = ['fffffffdffffffef8fff3fffffoffff0'];

    let onError = (error) => {
        console.error(error)
    };

    bleno.startAdvertising(name, serviceUuids, onError);
};

const onStateChange = (state) => {
    if(!!state){
        console.log("State changed: " + state);
        if(state === "poweredOn"){
            console.log("State Changed: Powered ON");
            console.log("Advertise IOTA!");
            advertiseIOTA();
        }
    }
};

bleno.on('stateChange', onStateChange);

const onAccept = (clientAddress) => {
    console.log("Accepted new client: " + clientAddress);

    var services = [
        "MAM"
    ];

    bleno.setServices(services, function(err){console.log(err)});
};


bleno.on('accept', onAccept);

/*onDiscovered = (peripheral) => {
  console.log("Disovered new peripheral.");
  console.log(peripheral);
};

noble.on('discover', onDiscovered);
*/


